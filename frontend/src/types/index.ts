
export interface ForecastPoint {
  time: string;
  observed?: number;
  forecast?: number;
}

export interface PlantMetrics {
  n2o: number;
  dissolvedOxygen: number;
  temperature: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  pumpStatus: "ACTIVE" | "INACTIVE";
}