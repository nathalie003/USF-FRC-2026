
from dataclasses import dataclass, asdict
import math

from .constraints import OperatingConstraints


@dataclass
class PlantConditions:
    dissolved_oxygen: float
    temperature: float
    ammonia: float
    n2o_forecast: float


@dataclass
class ScenarioResult:
    baseline_do: float
    proposed_do: float
    do_change: float
    relative_aeration_demand: float
    n2o_reduction_percent: float | None
    within_demo_limits: bool
    water_quality_verified: bool
    violations: list[str]
    recommendation: str
    model_status: str


def oxygen_saturation(temperature: float) -> float:
    """
    Approximate freshwater oxygen saturation at sea level.
    Returns dissolved oxygen concentration in mg/L.
    """
    return (
        14.652
        - 0.41022 * temperature
        + 0.007991 * temperature**2
        - 0.000077774 * temperature**3
    )


def estimate_aeration_demand(
    current_do: float,
    proposed_do: float,
    temperature: float,
) -> float:
    """
    Relative oxygen-transfer demand under constant
    biological oxygen uptake.

    This is a simplified proxy, not measured blower
    electricity consumption.
    """

    saturation = oxygen_saturation(temperature)

    if current_do >= saturation or proposed_do >= saturation:
        raise ValueError(
            "DO must remain below estimated oxygen saturation."
        )

    baseline_driving_force = saturation - current_do
    proposed_driving_force = saturation - proposed_do

    return baseline_driving_force / proposed_driving_force


def simulate_intervention(
    conditions: PlantConditions,
    proposed_do: float,
    constraints: OperatingConstraints | None = None,
) -> dict:

    if constraints is None:
        constraints = OperatingConstraints()

    values = [
        conditions.dissolved_oxygen,
        conditions.temperature,
        conditions.ammonia,
        conditions.n2o_forecast,
        proposed_do,
    ]

    if not all(math.isfinite(value) for value in values):
        raise ValueError("All inputs must be finite numbers.")

    if not 0 <= conditions.temperature <= 40:
        raise ValueError(
            "Temperature must be between 0 and 40 Celsius."
        )

    if (
        conditions.dissolved_oxygen < 0
        or proposed_do < 0
        or conditions.ammonia < 0
        or conditions.n2o_forecast < 0
    ):
        raise ValueError(
            "DO, ammonia and N2O readings cannot be negative."
        )

    checks = constraints.evaluate(
        conditions.dissolved_oxygen,
        proposed_do,
    )

    demand = estimate_aeration_demand(
        conditions.dissolved_oxygen,
        proposed_do,
        conditions.temperature,
    )

    if not checks["within_demo_limits"]:
        recommendation = (
            "Reject scenario: outside configured demo limits."
        )

    elif proposed_do == conditions.dissolved_oxygen:
        recommendation = "Maintain baseline operating conditions."

    else:
        recommendation = (
            "Candidate for further evaluation. "
            "N2O response and effluent quality require validation."
        )

    result = ScenarioResult(
        baseline_do=conditions.dissolved_oxygen,
        proposed_do=proposed_do,
        do_change=round(
            proposed_do - conditions.dissolved_oxygen, 2
        ),
        relative_aeration_demand=round(demand, 4),
        n2o_reduction_percent=None,
        within_demo_limits=checks["within_demo_limits"],
        water_quality_verified=False,
        violations=checks["violations"],
        recommendation=recommendation,
        model_status="oxygen_transfer_proxy",
    )

    return asdict(result)