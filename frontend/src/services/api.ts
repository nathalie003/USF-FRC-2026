
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

export interface MonitoringObservation {
  time: string;
  influent_flowrate: number | null;
  dissolved_oxygen: number | null;
  ammonium: number | null;
  nitrate: number | null;
  n2o: number | null;
  temperature: number | null;
  n2o_emission_rate: number | null;
}

export interface MonitoringHistoryResponse {
  source: string;
  live: boolean;
  units_verified: boolean;
  total: number;
  offset: number;
  count: number;
  observations: MonitoringObservation[];
}

export interface MonitoringSummaryResponse {
  source: string;
  live: boolean;
  units_verified: boolean;
  total_observations: number;
  first_timestamp: string;
  last_timestamp: string;
  available_variables: string[];
  notes: string[];
}

export async function fetchMonitoringHistory(
  offset = 0,
  limit = 120
): Promise<MonitoringHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/history?offset=${offset}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load monitoring history (${response.status})`
    );
  }

  return response.json();
}

export async function fetchMonitoringSummary(): Promise<MonitoringSummaryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/summary`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load monitoring summary (${response.status})`
    );
  }

  return response.json();
}

export interface ForecastReason {
  sensor: string;
  direction: "raises" | "lowers";
  contribution: number;
}

export interface ForecastResponse {
  forecast: number;
  forecast_time: string;
  risk_level: "normal" | "watch" | "high_risk";
  watch_cutoff: number;
  high_risk_cutoff: number;
  spike_threshold: number;
  top_reasons: ForecastReason[];
  units: string;
  target: string;
  note: string;
  source: string;
  live: boolean;
  model: string;
  horizon_minutes: number;
  sampling_interval_minutes: number;
  window_start: string;
  window_end: string;
  units_verified: boolean;
  intervention_effect_verified: boolean;
}

export async function fetchLatestForecast(): Promise<ForecastResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/forecast/latest`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load AI forecast (${response.status})`
    );
  }

  return response.json();
}
