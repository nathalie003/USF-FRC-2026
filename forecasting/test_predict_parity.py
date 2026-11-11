"""Checks that live prediction matches training, and rejects bad input.

Run from the repo root:  python -m pytest forecasting/test_predict_parity.py -q
"""
import numpy as np
import pandas as pd
import pytest

from forecasting.config import HORIZON_MINUTES, STEP_MINUTES, WINDOW_ROWS
from forecasting.datasets import load_clean, load_splits
from forecasting.predict import _risk_level, load_artifacts, predict

CLEAN = load_clean()


def window_ending_at(t):
    start = t - pd.Timedelta(minutes=HORIZON_MINUTES)
    return CLEAN[(CLEAN.Time >= start) & (CLEAN.Time <= t)]


def test_live_prediction_matches_training_pipeline():
    """predict(window) must equal the model run on the training-style row."""
    meta, model, _ = load_artifacts()
    test = load_splits()["test"].sample(150, random_state=0)
    checked = 0
    for _, row in test.iterrows():
        w = window_ending_at(row["Time"])
        if len(w) != WINDOW_ROWS or not (w.Time.diff().dropna() == pd.Timedelta(minutes=STEP_MINUTES)).all():
            continue                       # window has a data gap; skip
        expected = float(np.clip(np.expm1(model.predict(row[meta["features"]].to_frame().T.astype(float)))[0], 0, None))
        assert predict(w)["forecast"] == pytest.approx(expected, abs=1e-4)
        checked += 1
    assert checked > 100


def test_output_fields_and_reasons():
    out = predict(window_ending_at(pd.Timestamp("2019-02-20 18:55:00")))
    for key in ("forecast", "forecast_time", "risk_level", "watch_cutoff",
                "high_risk_cutoff", "top_reasons", "units"):
        assert key in out
    assert out["risk_level"] in {"normal", "watch", "high_risk"}
    assert len(out["top_reasons"]) == 3
    assert out["forecast_time"] == "2019-02-20 19:25:00"


def test_rejects_wrong_length_gaps_and_missing_columns():
    w = window_ending_at(pd.Timestamp("2019-02-20 18:55:00"))
    with pytest.raises(ValueError):
        predict(w.iloc[1:])                              # only 6 readings
    gappy = w.copy()
    gappy.loc[gappy.index[3], "Time"] += pd.Timedelta(minutes=1)
    with pytest.raises(ValueError):
        predict(gappy)                                   # uneven spacing
    with pytest.raises(ValueError):
        predict(w.drop(columns=["DO"]))                  # missing sensor


def test_negative_current_flow_is_refused_not_guessed():
    w = window_ending_at(pd.Timestamp("2019-02-20 18:55:00")).copy()
    w.loc[w.index[-1], "Influent flowrate"] = -5.0       # invalid reading
    with pytest.raises(ValueError):
        predict(w)


def test_risk_levels():
    cuts = {"watch": 0.2, "high_risk": 0.4}
    assert _risk_level(0.1, cuts) == "normal"
    assert _risk_level(0.2, cuts) == "watch"
    assert _risk_level(0.4, cuts) == "high_risk"
