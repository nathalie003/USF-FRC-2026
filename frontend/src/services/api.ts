
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface PlantConditions {
  dissolved_oxygen: number;
  temperature: number;
  ammonia: number;
  n2o_forecast: number;
}

export interface SimulationRequest extends PlantConditions {
  proposed_do: number;
}

export interface ScenarioResult {
  baseline_do: number;
  proposed_do: number;
  do_change: number;
  relative_aeration_demand: number;
  n2o_reduction_percent: number | null;
  within_demo_limits: boolean;
  water_quality_verified: boolean;
  violations: string[];
  recommendation: string;
  model_status: string;
}

export interface OptimizationResult {
  baseline_do: number;
  n2o_forecast: number;
  scenarios: ScenarioResult[];
  eligible_scenarios: number;
  recommended_intervention: ScenarioResult | null;
  status: string;
  message: string;
}

async function post<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `API request failed (${response.status})`
    );
  }

  return response.json();
}

export function simulateIntervention(
  data: SimulationRequest
): Promise<ScenarioResult> {
  return post<ScenarioResult>(
    "/api/interventions/simulate",
    data
  );
}

export function optimizeInterventions(
  data: PlantConditions
): Promise<OptimizationResult> {
  return post<OptimizationResult>(
    "/api/interventions/optimize",
    data
  );
}