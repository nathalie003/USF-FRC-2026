"""Feature building shared by training AND live prediction.

Using one code path for both prevents "train/serve skew" (the model being
trained on one recipe and fed a slightly different one later).
Every feature uses only the present and the past, never the future.
"""
import re

import pandas as pd

from forecasting.config import (
    CURRENT_EMISSION, HORIZON_MINUTES, LAG_MINUTES, SENSORS, TARGET,
)


def lag_cols():
    return [f"{c}_lag_{m}m" for m in LAG_MINUTES for c in SENSORS]


def build_feature_frame(clean: pd.DataFrame) -> pd.DataFrame:
    """Turn cleaned sensor rows (Time + 7 sensors) into model inputs.

    Adds, for every sensor: lagged values (5/15/30 min ago), the change over
    the last 5 and 30 minutes (rate of change), and the average over the last
    30 minutes. Lags use exact timestamp matches, so a gap in the data never
    becomes a fake 5-minute step.
    """
    df = clean.sort_values("Time").reset_index(drop=True)
    out = df[["Time"] + SENSORS].copy()

    # 1) lagged readings via exact timestamp joins (same method as data eng.)
    for m in LAG_MINUTES:
        lag = df[["Time"] + SENSORS].copy()
        lag["Time"] = lag["Time"] + pd.Timedelta(minutes=m)
        lag = lag.rename(columns={c: f"{c}_lag_{m}m" for c in SENSORS})
        out = out.merge(lag, on="Time", how="left", validate="one_to_one")

    # 2) rate of change = now minus 5 / 30 minutes ago
    for c in SENSORS:
        out[f"{c}_chg_5m"] = out[c] - out[f"{c}_lag_5m"]
        out[f"{c}_chg_30m"] = out[c] - out[f"{c}_lag_30m"]

    # 3) 30-minute average over the window [t-30min, t] (up to 7 readings).
    #    Blank readings are skipped; at least 4 readings are required.
    roll = (
        df.set_index("Time")[SENSORS]
        .rolling("30min", closed="both", min_periods=4)
        .mean()
        .reset_index()
        .rename(columns={c: f"{c}_mean_30m" for c in SENSORS})
    )
    out = out.merge(roll, on="Time", how="left", validate="one_to_one")
    return out


def add_target(features: pd.DataFrame, clean: pd.DataFrame) -> pd.DataFrame:
    """Attach the answer we want to predict: emission rate 30 min later."""
    future = clean[["Time", CURRENT_EMISSION]].copy()
    future["Time"] = future["Time"] - pd.Timedelta(minutes=HORIZON_MINUTES)
    future = future.rename(columns={CURRENT_EMISSION: TARGET})
    return features.merge(future, on="Time", how="left", validate="one_to_one")


def model_feature_names():
    """Ordered list of columns the model is trained on (everything but Time)."""
    base = list(SENSORS)
    chg = [f"{c}_chg_{m}m" for c in SENSORS for m in (5, 30)]
    mean = [f"{c}_mean_30m" for c in SENSORS]
    return base + lag_cols() + chg + mean


def without_n2o(names):
    """Drop every N2O / N2O-emission-rate column (used for the ablation)."""
    return [n for n in names if not n.startswith("N2O")]


def base_sensor(feature_name: str) -> str:
    """Map e.g. 'DO_chg_5m' -> 'DO', so explanations are in plain sensor terms."""
    return re.sub(r"(_lag_\d+m|_chg_\d+m|_mean_30m)$", "", feature_name)


def clean_window(window: pd.DataFrame) -> pd.DataFrame:
    """Apply the data engineer's rule: negative readings are invalid (blank)."""
    w = window.copy()
    for c in SENSORS:
        w.loc[w[c] < 0, c] = float("nan")
    return w


__all__ = [
    "build_feature_frame", "add_target", "model_feature_names", "without_n2o",
    "base_sensor", "clean_window",
]
