
from .simulator import (
    PlantConditions,
    simulate_intervention,
)
from .constraints import OperatingConstraints


def evaluate_candidates(
    conditions: PlantConditions,
) -> dict:

    constraints = OperatingConstraints()

    candidates = sorted({
        round(conditions.dissolved_oxygen - 0.5, 2),
        round(conditions.dissolved_oxygen - 0.25, 2),
        round(conditions.dissolved_oxygen, 2),
        round(conditions.dissolved_oxygen + 0.25, 2),
        round(conditions.dissolved_oxygen + 0.5, 2),
    })

    results = []

    for target in candidates:

        if target < 0:
            continue

        try:
            result = simulate_intervention(
                conditions,
                target,
                constraints,
            )

            results.append(result)

        except ValueError:
            continue

    eligible = [
        result
        for result in results
        if result["within_demo_limits"]
    ]

    return {
        "baseline_do": conditions.dissolved_oxygen,
        "n2o_forecast": conditions.n2o_forecast,
        "scenarios": results,
        "eligible_scenarios": len(eligible),
        "recommended_intervention": None,
        "status": "requires_n2o_response_model",
        "message": (
            "Scenarios have been screened against demo limits. "
            "An emissions-reduction recommendation requires "
            "a validated N2O response model."
        ),
    }