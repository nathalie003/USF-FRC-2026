
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from simulation.simulator import (
    PlantConditions,
    simulate_intervention,
)
from simulation.optimizer import evaluate_candidates


router = APIRouter(
    prefix="/api/interventions",
    tags=["Interventions"],
)


class PlantConditionsRequest(BaseModel):
    dissolved_oxygen: float = Field(ge=0, le=15)
    temperature: float = Field(ge=0, le=40)
    ammonia: float = Field(ge=0)
    n2o_forecast: float = Field(ge=0)


class SimulationRequest(PlantConditionsRequest):
    proposed_do: float = Field(ge=0, le=15)


@router.post("/simulate")
def simulate(request: SimulationRequest):

    conditions = PlantConditions(
        dissolved_oxygen=request.dissolved_oxygen,
        temperature=request.temperature,
        ammonia=request.ammonia,
        n2o_forecast=request.n2o_forecast,
    )

    try:
        return simulate_intervention(
            conditions,
            request.proposed_do,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/optimize")
def optimize(request: PlantConditionsRequest):

    conditions = PlantConditions(
        dissolved_oxygen=request.dissolved_oxygen,
        temperature=request.temperature,
        ammonia=request.ammonia,
        n2o_forecast=request.n2o_forecast,
    )

    try:
        return evaluate_candidates(conditions)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
