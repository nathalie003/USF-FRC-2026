
"""Historical N2O emission forecasting endpoints."""

import sys
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException

ROOT = Path(__file__).resolve().parents[2]

# Allow the backend to import the repository's forecasting package,
# even when Uvicorn is launched from the backend directory.
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from forecasting.config import (
    CLEANED_CSV,
    HORIZON_MINUTES,
    SENSORS,
    STEP_MINUTES,
    WINDOW_ROWS,
)
from forecasting.predict import predict

router = APIRouter(
    prefix="/api/forecast",
    tags=["Forecasting"],
)


@router.get("/latest")
def get_latest_forecast():
    """Forecast 30 minutes beyond the newest valid historical window."""

    if not CLEANED_CSV.exists():
        raise HTTPException(
            status_code=503,
            detail="Historical forecasting dataset is unavailable.",
        )

    try:
        data = pd.read_csv(CLEANED_CSV, parse_dates=["Time"])
        data = data.sort_values("Time").reset_index(drop=True)

        required = ["Time"] + SENSORS
        missing = [column for column in required if column not in data.columns]

        if missing:
            raise HTTPException(
                status_code=503,
                detail=f"Missing forecasting columns: {missing}",
            )

        # Find a valid seven-reading window. Missing values, irregular
        # timestamps and invalid sensor readings are rejected by predict().
        # Search backward because the final historical rows may be incomplete.
        last_error = None

        for end in range(len(data), WINDOW_ROWS - 1, -1):
            window = data.iloc[end - WINDOW_ROWS:end][required].copy()

            try:
                result = predict(window)

                return {
                    **result,
                    "source": "historical_dataset",
                    "live": False,
                    "model": "XGBoost",
                    "horizon_minutes": HORIZON_MINUTES,
                    "sampling_interval_minutes": STEP_MINUTES,
                    "window_start": str(window["Time"].iloc[0]),
                    "window_end": str(window["Time"].iloc[-1]),
                    "units_verified": False,
                    "intervention_effect_verified": False,
                }

            except ValueError as error:
                last_error = str(error)
                continue

        raise HTTPException(
            status_code=422,
            detail=(
                "No valid historical forecasting window was found. "
                f"Last validation error: {last_error}"
            ),
        )

    except HTTPException:
        raise

    except (FileNotFoundError, OSError) as error:
        raise HTTPException(
            status_code=503,
            detail=f"Forecasting files are unavailable: {error}",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Forecasting failed: {type(error).__name__}: {error}",
        )