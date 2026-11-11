"""Load the train / validation / test splits with all model features.

The row membership of each split comes straight from the data engineer's
train.csv / validation.csv / test.csv (so nobody's splits are changed).
We rebuild the features with our shared code, then check that the columns
the data engineer already produced match ours exactly.
"""
import numpy as np
import pandas as pd

from forecasting.config import (
    CLEANED_CSV, SENSORS, TARGET, TEST_CSV, TRAIN_CSV, VALIDATION_CSV,
)
from forecasting.feature_engineering import (
    add_target, build_feature_frame, lag_cols, model_feature_names,
)


def load_clean() -> pd.DataFrame:
    """Cleaned sensor history (negative flow already blanked out)."""
    return pd.read_csv(CLEANED_CSV, parse_dates=["Time"])


def load_splits() -> dict:
    clean = load_clean()
    feats = add_target(build_feature_frame(clean), clean)
    names = model_feature_names()
    splits = {}
    for split, path in (("train", TRAIN_CSV), ("validation", VALIDATION_CSV),
                        ("test", TEST_CSV)):
        ref = pd.read_csv(path, parse_dates=["Time"])
        part = ref[["Time"]].merge(feats, on="Time", how="left",
                                   validate="one_to_one")

        # Integrity check 1: no blanks in anything the model will see.
        if part[names + [TARGET]].isna().any().any():
            bad = part[names + [TARGET]].isna().sum()
            raise ValueError(f"{split}: unexpected blanks:\n{bad[bad > 0]}")

        # Integrity check 2: our lags/target equal the data engineer's.
        for col in SENSORS + lag_cols() + [TARGET]:
            if not np.allclose(part[col].to_numpy(), ref[col].to_numpy(),
                               rtol=0, atol=1e-9, equal_nan=True):
                raise ValueError(f"{split}: column '{col}' differs from {path.name}")
        splits[split] = part
    return splits
