"""Train the N2O emission-rate forecaster.   Run from the repo root:

    python -m ai.train

This script NEVER touches the test set. It uses train data to fit, validation
data to pick settings and alert cutoffs, and saves everything for evaluation.
"""
import json
import platform
import random

import numpy as np
import pandas as pd
import shap
import sklearn
import xgboost as xgb

from forecasting.config import (
    ABLATION_MODEL_PATH, EARLY_STOPPING_ROUNDS, METADATA_PATH, MODEL_PATH,
    MODELS_DIR, N_TUNING_TRIALS, RANDOM_STATE, REPORTS_DIR, SPIKE_QUANTILE,
    TARGET, UNITS_LABEL,
)
from forecasting.datasets import load_splits
from forecasting.evaluation import (
    choose_cutoffs, predict_original_scale, regression_metrics,
)
from forecasting.feature_engineering import model_feature_names, without_n2o

SEARCH_SPACE = {                      # a modest grid, per the team decision
    "max_depth": [3, 4, 5, 6, 8],
    "learning_rate": [0.02, 0.05, 0.1],
    "min_child_weight": [1, 5, 20],
    "subsample": [0.7, 0.85, 1.0],
    "colsample_bytree": [0.6, 0.8, 1.0],
    "reg_lambda": [1, 5, 20],
}


def sample_trials(n, seed):
    """Draw n distinct random settings (same seed -> same trials)."""
    rng = random.Random(seed)
    trials, seen = [], set()
    while len(trials) < n:
        t = {k: rng.choice(v) for k, v in SEARCH_SPACE.items()}
        key = tuple(sorted(t.items()))
        if key not in seen:
            seen.add(key)
            trials.append(t)
    return trials


def fit_model(params, features, splits):
    """Fit on train (log1p target); early-stop on validation."""
    tr, va = splits["train"], splits["validation"]
    model = xgb.XGBRegressor(
        objective="reg:squarederror", eval_metric="rmse", tree_method="hist",
        n_estimators=2000, early_stopping_rounds=EARLY_STOPPING_ROUNDS,
        random_state=RANDOM_STATE, n_jobs=-1, **params,
    )
    model.fit(tr[features], np.log1p(tr[TARGET]),
              eval_set=[(va[features], np.log1p(va[TARGET]))], verbose=False)
    return model


def main():
    MODELS_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(exist_ok=True)
    splits = load_splits()
    features = model_feature_names()
    tr, va = splits["train"], splits["validation"]

    # A "real spike" = above the top 15% of TRAINING targets (fixed forever).
    spike_threshold = float(np.quantile(tr[TARGET], SPIKE_QUANTILE))
    print(f"Real-spike threshold (train 85th percentile): {spike_threshold:.4f} {UNITS_LABEL}")
    print(f"Spike share  train {np.mean(tr[TARGET] > spike_threshold):.1%} | "
          f"validation {np.mean(va[TARGET] > spike_threshold):.1%}")

    # ---- tuning: judge every setting on validation (original units) ----
    rows = []
    best = None
    for i, params in enumerate(sample_trials(N_TUNING_TRIALS, RANDOM_STATE), 1):
        model = fit_model(params, features, splits)
        pred = predict_original_scale(model, va[features])
        m = regression_metrics(va[TARGET], pred)
        rows.append({"trial": i, **params, "best_iteration": int(model.best_iteration),
                     "val_MAE": m["MAE"], "val_RMSE": m["RMSE"]})
        print(f"trial {i:2d}  val RMSE {m['RMSE']:.4f}  MAE {m['MAE']:.4f}  {params}")
        if best is None or m["RMSE"] < best[0]:
            best = (m["RMSE"], params, model)
    pd.DataFrame(rows).to_csv(REPORTS_DIR / "tuning_results.csv", index=False)
    _, best_params, model = best
    print("Best settings:", best_params)

    # ---- alert cutoffs chosen on validation predictions only ----
    val_pred = predict_original_scale(model, va[features])
    watch, high = choose_cutoffs(va[TARGET].to_numpy() > spike_threshold, val_pred)
    print(f"Cutoffs (validation): watch {watch:.4f} | high risk {high:.4f}")
    model.save_model(MODEL_PATH)

    # ---- ablation: same settings, no N2O / emission-rate inputs at all ----
    abl_features = without_n2o(features)
    abl_model = fit_model(best_params, abl_features, splits)
    abl_pred = predict_original_scale(abl_model, va[abl_features])
    abl_watch, abl_high = choose_cutoffs(va[TARGET].to_numpy() > spike_threshold, abl_pred)
    abl_model.save_model(ABLATION_MODEL_PATH)

    meta = {
        "target": TARGET, "units": UNITS_LABEL,
        "features": features, "log_target": True,
        "spike_threshold": spike_threshold,
        "spike_quantile": SPIKE_QUANTILE,
        "cutoffs": {"watch": watch, "high_risk": high},
        "best_params": best_params, "best_iteration": int(model.best_iteration),
        "ablation": {"features": abl_features,
                     "cutoffs": {"watch": abl_watch, "high_risk": abl_high},
                     "best_iteration": int(abl_model.best_iteration)},
        "data": {s: {"rows": int(len(d)), "first": str(d.Time.min()), "last": str(d.Time.max())}
                 for s, d in splits.items()},
        "versions": {"python": platform.python_version(), "xgboost": xgb.__version__,
                     "shap": shap.__version__, "scikit-learn": sklearn.__version__,
                     "pandas": pd.__version__, "numpy": np.__version__},
    }
    METADATA_PATH.write_text(json.dumps(meta, indent=2))
    print(f"Saved {MODEL_PATH.name}, {ABLATION_MODEL_PATH.name}, {METADATA_PATH.name}")


if __name__ == "__main__":
    main()
