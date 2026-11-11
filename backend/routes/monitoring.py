
import csv
import math
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])

DATA_PATH = (
    Path(__file__).resolve().parents[2]
    / "n2o_guardian_data"
    / "cleaned_data.csv"
)

FIELDS = {
    "Influent flowrate": "influent_flowrate",
    "DO": "dissolved_oxygen",
    "NH4": "ammonium",
    "NO3": "nitrate",
    "N2O": "n2o",
    "Temperature": "temperature",
    "N2O emission rate": "n2o_emission_rate",
}


def parse_number(value):
    if value is None or value.strip() == "":
        return None

    try:
        number = float(value)
        return number if math.isfinite(number) else None
    except ValueError:
        return None


def load_observations():
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail="Historical monitoring dataset is unavailable.",
        )

    observations = []

    with DATA_PATH.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        for row in reader:
            timestamp = row.get("Time")

            if not timestamp:
                continue

            try:
                parsed_time = datetime.fromisoformat(timestamp)
            except ValueError:
                continue

            observation = {
                "time": parsed_time.isoformat(),
            }

            for source_name, api_name in FIELDS.items():
                observation[api_name] = parse_number(
                    row.get(source_name)
                )

            observations.append(observation)

    return observations


@router.get("/history")
def get_history(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=120, ge=1, le=500),
):
    observations = load_observations()

    total = len(observations)

    if offset >= total:
        return {
            "source": "historical_dataset",
            "live": False,
            "units_verified": False,
            "total": total,
            "offset": offset,
            "count": 0,
            "observations": [],
        }

    selected = observations[offset : offset + limit]

    return {
        "source": "historical_dataset",
        "live": False,
        "units_verified": False,
        "total": total,
        "offset": offset,
        "count": len(selected),
        "observations": selected,
    }


@router.get("/summary")
def get_summary():
    observations = load_observations()

    if not observations:
        raise HTTPException(
            status_code=503,
            detail="No historical observations are available.",
        )

    return {
        "source": "historical_dataset",
        "live": False,
        "units_verified": False,
        "total_observations": len(observations),
        "first_timestamp": observations[0]["time"],
        "last_timestamp": observations[-1]["time"],
        "available_variables": list(FIELDS.values()),
        "notes": [
            "Historical observations, not live telemetry.",
            "Measurement units have not been verified.",
            "No causal intervention effects are inferred.",
        ],
    }