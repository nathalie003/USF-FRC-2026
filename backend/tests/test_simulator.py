
import pytest

from simulation.simulator import (
    PlantConditions,
    simulate_intervention,
)
from simulation.optimizer import evaluate_candidates


@pytest.fixture
def conditions():
    return PlantConditions(
        dissolved_oxygen=2.0,
        temperature=20.0,
        ammonia=3.5,
        n2o_forecast=0.81,
    )


def test_baseline(conditions):
    result = simulate_intervention(conditions, 2.0)

    assert result["relative_aeration_demand"] == 1.0
    assert result["do_change"] == 0


def test_higher_do(conditions):
    result = simulate_intervention(conditions, 2.5)

    assert result["relative_aeration_demand"] > 1
    assert result["within_demo_limits"] is True


def test_lower_do(conditions):
    result = simulate_intervention(conditions, 1.5)

    assert result["relative_aeration_demand"] < 1
    assert result["within_demo_limits"] is True


def test_large_adjustment_rejected(conditions):
    result = simulate_intervention(conditions, 3.0)

    assert result["within_demo_limits"] is False
    assert len(result["violations"]) > 0


def test_no_unvalidated_emissions_claim(conditions):
    result = simulate_intervention(conditions, 2.5)

    assert result["n2o_reduction_percent"] is None
    assert result["water_quality_verified"] is False


def test_candidate_generation(conditions):
    result = evaluate_candidates(conditions)

    assert len(result["scenarios"]) == 5
    assert result["recommended_intervention"] is None


def test_invalid_input(conditions):
    with pytest.raises(ValueError):
        simulate_intervention(conditions, -1.0)