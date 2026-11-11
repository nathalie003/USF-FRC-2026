"""Metrics, alert-cutoff selection, and the one-time held-out test evaluation.

Run from the repo root AFTER training:   python -m ai.evaluation
The test set is evaluated exactly once. A lock file stops accidental re-runs
(use --force only if you retrain and knowingly want a fresh test result).
"""
import argparse
import json
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
import xgboost as xgb
from sklearn.metrics import (
    average_precision_score, mean_absolute_error, mean_squared_error,
    precision_recall_curve,
)

from forecasting.config import (
    ABLATION_MODEL_PATH, CURRENT_EMISSION, METADATA_PATH, MODEL_PATH,
    REPORTS_DIR, TARGET, TARGET_LABEL, TEST_LOCK_PATH, UNITS_LABEL,
    WATCH_RECALL_TARGET,
)
from forecasting.datasets import load_splits
from forecasting.feature_engineering import base_sensor


# ----------------------------------------------------------------- helpers
def predict_original_scale(model, X) -> np.ndarray:
    """Models are trained on log1p(target); convert back to original units."""
    return np.clip(np.expm1(model.predict(X)), 0, None)


def regression_metrics(y_true, y_pred) -> dict:
    return {
        "MAE": float(mean_absolute_error(y_true, y_pred)),
        "RMSE": float(np.sqrt(mean_squared_error(y_true, y_pred))),
    }


def choose_cutoffs(is_spike, y_pred, recall_target=WATCH_RECALL_TARGET):
    """Pick alert cutoffs from VALIDATION predictions.

    High risk = the cutoff with the best balance of caught spikes and false
                alarms (highest F1).
    Watch     = the strictest cutoff that still catches >= recall_target of
                real spikes (never stricter than High risk).
    """
    precision, recall, thresholds = precision_recall_curve(is_spike, y_pred)
    precision, recall = precision[:-1], recall[:-1]      # align with thresholds
    f1 = 2 * precision * recall / np.maximum(precision + recall, 1e-12)
    high = float(thresholds[np.argmax(f1)])
    ok = np.where(recall >= recall_target)[0]
    watch = float(thresholds[ok.max()]) if len(ok) else float(thresholds.min())
    return min(watch, high), high


def _alert_stats(is_spike, alert) -> dict:
    tp = int(np.sum(alert & is_spike))
    fp = int(np.sum(alert & ~is_spike))
    fn = int(np.sum(~alert & is_spike))
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return {
        "alerts": tp + fp, "spikes_caught": tp, "spikes_missed": fn,
        "false_alarms": fp, "precision": precision, "recall": recall, "F1": f1,
    }


def evaluate_split(df, pred, cuts, spike_threshold) -> dict:
    """All headline numbers for one split (validation or test)."""
    y = df[TARGET].to_numpy()
    persistence = df[CURRENT_EMISSION].to_numpy()        # "same as now" guess
    is_spike = y > spike_threshold
    out = {
        "rows": int(len(df)),
        "real_spikes": int(is_spike.sum()),
        "real_spike_share": float(is_spike.mean()),
        "model": regression_metrics(y, pred),
        "persistence_baseline": regression_metrics(y, persistence),
        "spike_PR_AUC": {
            "model": float(average_precision_score(is_spike, pred)) if is_spike.any() else None,
            "persistence_baseline": float(average_precision_score(is_spike, persistence)) if is_spike.any() else None,
        },
    }
    for level, cut in (("watch", cuts["watch"]), ("high_risk", cuts["high_risk"])):
        out[f"alerts_{level}"] = {
            "cutoff": cut,
            "model": _alert_stats(is_spike, pred >= cut),
            "persistence_baseline": _alert_stats(is_spike, persistence >= cut),
        }
    return out


# ------------------------------------------------------------------ charts
def chart_forecast_vs_actual(df, pred, cuts, spike_threshold, path):
    t = df["Time"].to_numpy()
    y = df[TARGET].to_numpy()
    fig, axes = plt.subplots(2, 1, figsize=(12, 7))
    # top: whole test period
    axes[0].plot(t, y, lw=0.6, label="Actual", color="#1f77b4")
    axes[0].plot(t, pred, lw=0.6, label="Forecast", color="#ff7f0e", alpha=0.85)
    axes[0].axhline(cuts["high_risk"], color="red", ls="--", lw=1, label="High-risk cutoff")
    axes[0].axhline(cuts["watch"], color="gold", ls="--", lw=1, label="Watch cutoff")
    axes[0].set_title(f"Held-out test period: {TARGET_LABEL}, 30 minutes ahead")
    axes[0].set_ylabel(UNITS_LABEL)
    axes[0].legend(loc="upper right", ncol=4, fontsize=8)
    # bottom: 2-day zoom around the largest actual spike
    centre = int(np.argmax(y))
    lo, hi = max(0, centre - 288), min(len(y), centre + 288)
    axes[1].plot(t[lo:hi], y[lo:hi], lw=1.2, label="Actual", color="#1f77b4")
    axes[1].plot(t[lo:hi], pred[lo:hi], lw=1.2, label="Forecast", color="#ff7f0e")
    axes[1].axhline(cuts["high_risk"], color="red", ls="--", lw=1)
    axes[1].axhline(cuts["watch"], color="gold", ls="--", lw=1)
    axes[1].axhline(spike_threshold, color="grey", ls=":", lw=1, label="Real-spike threshold (top 15% of training)")
    axes[1].set_title("Zoom: two days around the largest test spike")
    axes[1].set_ylabel(UNITS_LABEL)
    axes[1].legend(loc="upper right", fontsize=8)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)


def chart_cutoff_selection(df_val, pred_val, cuts, spike_threshold, path):
    is_spike = df_val[TARGET].to_numpy() > spike_threshold
    precision, recall, thr = precision_recall_curve(is_spike, pred_val)
    precision, recall = precision[:-1], recall[:-1]
    f1 = 2 * precision * recall / np.maximum(precision + recall, 1e-12)
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.plot(thr, precision, label="Precision (alerts that were real)")
    ax.plot(thr, recall, label="Recall (real spikes caught)")
    ax.plot(thr, f1, label="F1", lw=1, alpha=0.7)
    ax.axvline(cuts["watch"], color="gold", ls="--", label=f"Watch cutoff {cuts['watch']:.3f}")
    ax.axvline(cuts["high_risk"], color="red", ls="--", label=f"High-risk cutoff {cuts['high_risk']:.3f}")
    ax.set_xlim(0, min(thr.max(), np.quantile(pred_val, 0.999)))
    ax.set_xlabel(f"Alert cutoff on forecast ({UNITS_LABEL})")
    ax.set_title("How the alert cutoffs were chosen (validation data only)")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)


def chart_sensor_importance(model, X_val, path) -> dict:
    """Global explanation: average SHAP push per sensor (validation data)."""
    shap_vals = shap.TreeExplainer(model).shap_values(X_val)
    per_feature = pd.Series(np.abs(shap_vals).mean(axis=0), index=X_val.columns)
    per_sensor = per_feature.groupby(base_sensor).sum().sort_values()
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.barh(per_sensor.index, per_sensor.values, color="#2a9d8f")
    ax.set_xlabel("Average influence on the forecast (SHAP, log scale)")
    ax.set_title("Which sensors drive the forecast")
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return {k: float(v) for k, v in per_sensor.sort_values(ascending=False).items()}


# -------------------------------------------------------------------- main
def _summary_markdown(res) -> str:
    t, v = res["test"], res["validation"]
    h, w = t["alerts_high_risk"]["model"], t["alerts_watch"]["model"]
    hp = t["alerts_high_risk"]["persistence_baseline"]
    abl = res["ablation_without_n2o_inputs"]["test"]
    cuts = res["cutoffs"]
    lines = [
        f"# N\u2082O Guardian: model results ({TARGET_LABEL}, 30 min ahead)",
        f"All values are in **{UNITS_LABEL}** (the dataset does not define units).",
        "",
        "## Average error (lower is better)",
        "| Split | Model MAE | 'Same as now' MAE | Model RMSE | 'Same as now' RMSE |",
        "|---|---|---|---|---|",
    ]
    for name, r in (("Validation", v), ("Test", t)):
        lines.append(f"| {name} | {r['model']['MAE']:.4f} | {r['persistence_baseline']['MAE']:.4f} | "
                     f"{r['model']['RMSE']:.4f} | {r['persistence_baseline']['RMSE']:.4f} |")
    lines += [
        "",
        f"## Spike alerts on the test data (real spike = above {res['spike_threshold']:.3f}, top 15% of training)",
        f"Test period contains {t['real_spikes']} real-spike rows ({t['real_spike_share']:.1%} of rows).",
        "| Alert level | Cutoff | Spikes caught | Spikes missed | False alarms | Precision | Recall |",
        "|---|---|---|---|---|---|---|",
        f"| Watch | {cuts['watch']:.3f} | {w['spikes_caught']} | {w['spikes_missed']} | {w['false_alarms']} | {w['precision']:.2f} | {w['recall']:.2f} |",
        f"| High risk | {cuts['high_risk']:.3f} | {h['spikes_caught']} | {h['spikes_missed']} | {h['false_alarms']} | {h['precision']:.2f} | {h['recall']:.2f} |",
        f"| High risk, 'same as now' guess | {cuts['high_risk']:.3f} | {hp['spikes_caught']} | {hp['spikes_missed']} | {hp['false_alarms']} | {hp['precision']:.2f} | {hp['recall']:.2f} |",
        "",
        f"Spike ranking quality (PR-AUC, higher is better): model {t['spike_PR_AUC']['model']:.3f} vs 'same as now' {t['spike_PR_AUC']['persistence_baseline']:.3f}.",
        "",
        "## Honest answer to \"what if the plant has no live N\u2082O sensor?\"",
        f"Without any N\u2082O or emission-rate inputs the test MAE is {abl['model']['MAE']:.4f} "
        f"and RMSE {abl['model']['RMSE']:.4f}, versus {t['model']['MAE']:.4f} / {t['model']['RMSE']:.4f} with them.",
        "",
        "## Caveats",
        "- One plant, one 8-month period; spike frequency differed between seasons.",
        "- Units and negative-flow conventions are unverified.",
        "- Forecasts come from historical data; they say nothing about the effect of changing aeration.",
    ]
    return "\n".join(lines)


def main(force: bool = False):
    if TEST_LOCK_PATH.exists() and not force:
        sys.exit("Test set was already evaluated (reports/.test_set_evaluated). "
                 "It is meant to be used once. Re-run with --force only if you "
                 "retrained and understand the result is no longer a clean test.")
    meta = json.loads(METADATA_PATH.read_text())
    names, abl_names = meta["features"], meta["ablation"]["features"]
    spike_thr = meta["spike_threshold"]
    cuts = meta["cutoffs"]
    splits = load_splits()
    model, abl_model = xgb.XGBRegressor(), xgb.XGBRegressor()
    model.load_model(MODEL_PATH)
    abl_model.load_model(ABLATION_MODEL_PATH)

    results = {"spike_threshold": spike_thr, "cutoffs": cuts,
               "units": UNITS_LABEL, "target": TARGET_LABEL}
    preds = {}
    for split in ("validation", "test"):
        df = splits[split]
        preds[split] = predict_original_scale(model, df[names])
        results[split] = evaluate_split(df, preds[split], cuts, spike_thr)
    results["ablation_without_n2o_inputs"] = {"cutoffs": meta["ablation"]["cutoffs"]}
    for split in ("validation", "test"):
        df = splits[split]
        p = predict_original_scale(abl_model, df[abl_names])
        results["ablation_without_n2o_inputs"][split] = evaluate_split(
            df, p, meta["ablation"]["cutoffs"], spike_thr)

    REPORTS_DIR.mkdir(exist_ok=True)
    chart_forecast_vs_actual(splits["test"], preds["test"], cuts, spike_thr,
                             REPORTS_DIR / "forecast_vs_actual_test.png")
    chart_cutoff_selection(splits["validation"], preds["validation"], cuts, spike_thr,
                           REPORTS_DIR / "alert_cutoff_selection_validation.png")
    results["sensor_importance_validation"] = chart_sensor_importance(
        model, splits["validation"][names], REPORTS_DIR / "sensor_importance.png")

    (REPORTS_DIR / "metrics.json").write_text(json.dumps(results, indent=2))
    (REPORTS_DIR / "metrics_summary.md").write_text(_summary_markdown(results), encoding="utf-8")
    TEST_LOCK_PATH.write_text("Test set evaluated once. See metrics.json.\n")
    print(_summary_markdown(results))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="ignore the one-time test lock")
    main(ap.parse_args().force)
