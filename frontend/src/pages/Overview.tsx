
import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Waves,
  CalendarDays,
  BrainCircuit,
} from "lucide-react";

import MetricCard from "../components/MetricCard";
import ForecastChart from "../components/ForecastChart";
import AerationTank from "../components/AerationTank";
import RiskAlert from "../components/RiskAlert";

import {
  fetchLatestForecast,
  fetchMonitoringHistory,
} from "../services/api";

import type {
  ForecastResponse,
  MonitoringObservation,
} from "../services/api";

import type { ForecastPoint } from "../types";

function formatHistoricalTime(value: string): string {
  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function riskLabel(level: ForecastResponse["risk_level"]): string {
  switch (level) {
    case "high_risk":
      return "High risk";
    case "watch":
      return "Watch";
    default:
      return "Normal";
  }
}

function riskColor(level: ForecastResponse["risk_level"]): string {
  switch (level) {
    case "high_risk":
      return "text-red-400";
    case "watch":
      return "text-amber-400";
    default:
      return "text-[#22e000]";
  }
}

export default function Overview() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [latestObservation, setLatestObservation] =
    useState<MonitoringObservation | null>(null);
  const [recentObservations, setRecentObservations] =
    useState<MonitoringObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        const [forecastResult, historyResult] = await Promise.all([
          fetchLatestForecast(),
          fetchMonitoringHistory(74160, 12),
        ]);

        if (!active) return;

        setForecast(forecastResult);
        setRecentObservations(historyResult.observations);
        setLatestObservation(historyResult.observations.at(-1) ?? null);
        
        setError(null);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load historical AI data."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo<ForecastPoint[]>(() => {
  const observedPoints: ForecastPoint[] = recentObservations.map(
    (observation) => ({
      time: observation.time.slice(11, 16),
      observed: observation.n2o_emission_rate ?? undefined,
    })
  );

  if (forecast) {
    observedPoints.push({
      time: forecast.forecast_time.slice(11, 16),
      forecast: forecast.forecast,
    });
  }

  return observedPoints;
}, [recentObservations, forecast]);

  const lastObservedTime =
  recentObservations.at(-1)?.time.slice(11, 16);

  const currentEmission = latestObservation?.n2o_emission_rate;
  const currentDO = latestObservation?.dissolved_oxygen;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">Workspace</span>
          <span className="text-neutral-700">/</span>
          <span className="text-neutral-200">Plant overview</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
            <CalendarDays size={14} />
            Historical replay
          </span>

          <span className="flex items-center gap-2 border border-neutral-800 rounded-full px-3 py-1.5 text-[10px] text-neutral-400">
            <span className="w-1.5 h-1.5 bg-[#22e000] rounded-full" />
            DEMO MODE
          </span>
        </div>
      </div>

      {/* Heading */}
      <header className="py-3">
        <p className="text-[10px] text-[#22e000] tracking-[0.25em] font-semibold mb-3">
          INTELLIGENT WASTEWATER SYSTEMS
        </p>

        <h1 className="text-4xl lg:text-5xl font-medium text-white tracking-tight">
          Plant intelligence.
        </h1>

        <p className="text-neutral-500 text-sm mt-3">
          Anticipate emissions. Support operational decisions. Protect the environment.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
          Unable to load dashboard data: {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="N₂O emission rate"
          value={
            loading
              ? "Loading..."
              : currentEmission != null
                ? currentEmission.toFixed(4)
                : "Unavailable"
          }
          subtitle="Latest historical measurement · units unverified"
          icon={Activity}
          color="text-white"
        />

        <MetricCard
          title="30-minute forecast"
          value={
            loading
              ? "Loading..."
              : forecast
                ? forecast.forecast.toFixed(4)
                : "Unavailable"
          }
          subtitle="XGBoost prediction · reported units"
          icon={BrainCircuit}
          color="text-[#22e000]"
        />

        <MetricCard
          title="Forecast risk"
          value={
            loading
              ? "Loading..."
              : forecast
                ? riskLabel(forecast.risk_level)
                : "Unavailable"
          }
          subtitle="Model-based risk classification"
          icon={AlertTriangle}
          color={
            forecast
              ? riskColor(forecast.risk_level)
              : "text-white"
          }
        />

        <MetricCard
          title="Dissolved oxygen"
          value={
            loading
              ? "Loading..."
              : currentDO != null
                ? currentDO.toFixed(2)
                : "Unavailable"
          }
          subtitle="Latest historical reading · units unverified"
          icon={Waves}
          color="text-white"
        />
      </div>

      {/* AI prediction details */}
      <section className="panel p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#22e000] mb-2">
              XGBOOST FORECAST ENGINE
            </p>

            <h2 className="text-xl font-medium text-white">
              AI emission forecast
            </h2>

            <p className="text-xs text-neutral-500 mt-2">
              Trained on historical wastewater sensor observations.
            </p>
          </div>

          <span className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300">
            30-minute horizon
          </span>
        </div>

        {forecast ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-800 p-4">
                <p className="text-xs text-neutral-500 mb-2">
                  Predicted emission rate
                </p>
                <p className="text-3xl text-white font-semibold">
                  {forecast.forecast.toFixed(4)}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  Reported units
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 p-4">
                <p className="text-xs text-neutral-500 mb-2">
                  Risk classification
                </p>
                <p className={`text-2xl font-semibold ${riskColor(forecast.risk_level)}`}>
                  {riskLabel(forecast.risk_level)}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  Watch ≥ {forecast.watch_cutoff.toFixed(4)} ·
                  High ≥ {forecast.high_risk_cutoff.toFixed(4)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 p-4">
                <p className="text-xs text-neutral-500 mb-2">
                  Forecast timestamp
                </p>
                <p className="text-lg text-white font-medium">
                  {formatHistoricalTime(forecast.forecast_time)}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  Historical demonstration
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-white font-medium mb-3">
                Top contributing sensors
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {forecast.top_reasons.map((reason) => (
                  <div
                    key={reason.sensor}
                    className="rounded-xl border border-neutral-800 p-4"
                  >
                    <p className="text-sm text-white font-medium">
                      {reason.sensor}
                    </p>

                    <p
                      className={`text-xs mt-2 ${
                        reason.direction === "raises"
                          ? "text-amber-400"
                          : "text-[#22e000]"
                      }`}
                    >
                      {reason.direction === "raises"
                        ? "Raises forecast"
                        : "Lowers forecast"}
                    </p>

                    <p className="text-xs text-neutral-500 mt-1">
                      SHAP contribution: {reason.contribution.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-neutral-500">
              SHAP contributions describe model behavior on a transformed
              prediction scale. They do not establish causal effects.
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            {loading
              ? "Loading historical forecast..."
              : "Forecast data is unavailable."}
          </p>
        )}
      </section>

      {/* Existing visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <div className="space-y-2">
          <ForecastChart
              data={chartData}
              forecastValue={forecast?.forecast}
              forecastTime={forecast?.forecast_time.slice(11, 16)}
              lastObservedTime={lastObservedTime}
              />
          
        </div>

        <AerationTank />
      </div>

      <RiskAlert />

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-4 pb-2">
        <p className="text-[10px] text-neutral-600">
          N₂O Guardian © 2026 · NSBE AI Impact-A-Thon
        </p>

        <p className="text-[10px] text-neutral-600">
          Historical AI demonstration · Not for operational plant control
        </p>
      </footer>
    </div>
  );
}
