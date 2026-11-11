"""Prediction function for the dashboard.

    from forecasting.predict import predict
    result = predict(window_df)

`window_df` = the last 30 minutes of sensor readings: 7 rows, exactly 5
minutes apart, with columns Time + the 7 sensors. See `predict()` below.
"""
import argparse
import json
from functools import lru_cache

import numpy as np
import pandas as pd
import shap
import xgboost as xgb

from forecasting.config import (
    CLEANED_CSV, HORIZON_MINUTES, METADATA_PATH, MODEL_PATH, SENSORS,
    STEP_MINUTES, TARGET_LABEL, UNITS_LABEL, WINDOW_ROWS,
)
from forecasting.feature_engineering import (
    base_sensor, build_feature_frame, clean_window,
)

N_REASONS = 3


@lru_cache(maxsize=1)
def load_artifacts():
    """Load model, settings and the SHAP explainer once, then reuse them."""
    meta = json.loads(METADATA_PATH.read_text())
    model = xgb.XGBRegressor()
    model.load_model(MODEL_PATH)
    return meta, model, shap.TreeExplainer(model)


def _validate_window(window: pd.DataFrame) -> pd.DataFrame:
    missing = [c for c in ["Time"] + SENSORS if c not in window.columns]
    if missing:
        raise ValueError(f"Window is missing columns: {missing}")
    w = window[["Time"] + SENSORS].copy()
    w["Time"] = pd.to_datetime(w["Time"])
    w = w.sort_values("Time").reset_index(drop=True)
    if len(w) != WINDOW_ROWS:
        raise ValueError(f"Need exactly {WINDOW_ROWS} readings (the last "
                         f"{HORIZON_MINUTES} minutes), got {len(w)}.")
    gaps = w["Time"].diff().dropna()
    if not (gaps == pd.Timedelta(minutes=STEP_MINUTES)).all():
        raise ValueError(f"Readings must be exactly {STEP_MINUTES} minutes apart.")
    return clean_window(w)    # negative readings -> blank, as in training


def build_model_input(window: pd.DataFrame, feature_names) -> pd.DataFrame:
    """Window of 7 readings -> the single row of features the model expects."""
    w = _validate_window(window)
    row = build_feature_frame(w).iloc[[-1]]            # newest reading
    X = row[feature_names]
    if X.isna().any().any():
        blanks = X.columns[X.isna().any()].tolist()
        raise ValueError("No forecast: invalid or missing sensor values in "
                         f"{blanks[:5]}{'...' if len(blanks) > 5 else ''}")
    return X.reset_index(drop=True)


def _risk_level(forecast, cuts) -> str:
    if forecast >= cuts["high_risk"]:
        return "high_risk"
    if forecast >= cuts["watch"]:
        return "watch"
    return "normal"


def predict(window: pd.DataFrame) -> dict:
    """Forecast the N2O emission rate 30 minutes after the newest reading.

    Returns a dictionary:
      forecast            predicted emission rate (reported units)
      forecast_time       timestamp the forecast is for (newest + 30 min)
      risk_level          'normal' | 'watch' | 'high_risk'
      watch_cutoff / high_risk_cutoff / spike_threshold   the rules used
      top_reasons         the 3 sensors pushing the forecast most, with
                          direction ('raises' / 'lowers') and size (SHAP,
                          log scale; bigger magnitude = bigger push)
      units, target, note
    """
    meta, model, explainer = load_artifacts()
    X = build_model_input(window, meta["features"])
    forecast = float(np.clip(np.expm1(model.predict(X))[0], 0, None))

    contrib = pd.Series(explainer.shap_values(X)[0], index=X.columns)
    by_sensor = contrib.groupby(base_sensor).sum()
    top = by_sensor.reindex(by_sensor.abs().sort_values(ascending=False).index)[:N_REASONS]
    reasons = [{"sensor": s, "direction": "raises" if v > 0 else "lowers",
                "contribution": round(float(v), 4)} for s, v in top.items()]

    newest = pd.to_datetime(window["Time"]).max()
    cuts = meta["cutoffs"]
    return {
        "forecast": round(forecast, 4),
        "forecast_time": str(newest + pd.Timedelta(minutes=HORIZON_MINUTES)),
        "risk_level": _risk_level(forecast, cuts),
        "watch_cutoff": round(cuts["watch"], 4),
        "high_risk_cutoff": round(cuts["high_risk"], 4),
        "spike_threshold": round(meta["spike_threshold"], 4),
        "top_reasons": reasons,
        "units": UNITS_LABEL,
        "target": TARGET_LABEL,
        "note": "Forecast from historical patterns; decision support only.",
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Demo: forecast from a stored window.")
    ap.add_argument("--time", default="2019-02-20 20:00:00",
                    help="newest reading's timestamp, taken from cleaned_data.csv")
    args = ap.parse_args()
    clean = pd.read_csv(CLEANED_CSV, parse_dates=["Time"])
    end = pd.Timestamp(args.time)
    demo = clean[(clean.Time > end - pd.Timedelta(minutes=HORIZON_MINUTES + 1)) & (clean.Time <= end)]
    print(json.dumps(predict(demo), indent=2))
