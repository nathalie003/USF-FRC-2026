
from dataclasses import dataclass


@dataclass
class OperatingConstraints:
    min_do: float = 1.0
    max_do: float = 3.5
    max_do_change: float = 0.5

    def evaluate(
        self,
        current_do: float,
        proposed_do: float,
    ) -> dict:

        violations = []

        if proposed_do < self.min_do:
            violations.append(
                "Proposed DO is below the configured minimum."
            )

        if proposed_do > self.max_do:
            violations.append(
                "Proposed DO exceeds the configured maximum."
            )

        if abs(proposed_do - current_do) > self.max_do_change:
            violations.append(
                "Proposed adjustment exceeds the configured "
                "maximum step size."
            )

        return {
            "within_demo_limits": len(violations) == 0,
            "violations": violations,
            "water_quality_verified": False,
        }