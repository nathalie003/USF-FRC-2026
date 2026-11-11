"""Shared settings for the N2O Guardian AI/ML package.

Every number that more than one file needs lives here, so the training,
evaluation and prediction code can never disagree with each other.
"""
from pathlib import Path

# ---------------------------------------------------------------- folders
ROOT = Path(__file__).resolve().parents[1]      # repo root (one level above ai/)
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"
REPORTS_DIR = ROOT / "reports"

CLEANED_CSV = DATA_DIR / "cleaned_data.csv"
TRAIN_CSV = DATA_DIR / "train.csv"
VALIDATION_CSV = DATA_DIR / "validation.csv"
TEST_CSV = DATA_DIR / "test.csv"

MODEL_PATH = MODELS_DIR / "n2o_xgb_model.json"
ABLATION_MODEL_PATH = MODELS_DIR / "n2o_xgb_no_n2o_inputs.json"
METADATA_PATH = MODELS_DIR / "model_metadata.json"
TEST_LOCK_PATH = REPORTS_DIR / ".test_set_evaluated"

# ------------------------------------------------------------------- data
SENSORS = [
    "Influent flowrate", "DO", "NH4", "NO3", "N2O", "Temperature",
    "N2O emission rate",
]
TARGET = "target_emission_rate_30m"
CURRENT_EMISSION = "N2O emission rate"          # the "same as now" baseline
LAG_MINUTES = (5, 15, 30)                       # history the model sees
STEP_MINUTES = 5                                # sensor sampling interval
HORIZON_MINUTES = 30                            # how far ahead we forecast
WINDOW_ROWS = HORIZON_MINUTES // STEP_MINUTES + 1   # 7 readings = 30 minutes

# ------------------------------------------------------------ spike rules
SPIKE_QUANTILE = 0.85          # a "real spike" = top 15% of TRAINING targets
WATCH_RECALL_TARGET = 0.90     # Watch level should catch >= 90% of spikes

# ------------------------------------------------------------------ misc
RANDOM_STATE = 42
N_TUNING_TRIALS = 12           # "modest set of settings"
EARLY_STOPPING_ROUNDS = 50
UNITS_LABEL = "reported units"  # the dataset does not define real units
TARGET_LABEL = "N\u2082O emission rate"
