import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  SlidersHorizontal,
  ShieldCheck,
  FlaskConical,
  Zap,
  AlertTriangle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import {
  simulateIntervention,
  optimizeInterventions,
  fetchLatestForecast,
  fetchMonitoringHistory,
} from "../services/api";

import type {
  ScenarioResult,
  OptimizationResult,
  ForecastResponse,
  PlantConditions,
} from "../services/api";

import AerationTank from "../components/AerationTank";

const DEMO_CONDITIONS = {
  dissolved_oxygen: 2.0,
  temperature: 20.0,
  ammonia: 3.5,
  n2o_forecast: 0.81,
};

export default function InterventionLab() {
  const [targetDO, setTargetDO] = useState(2.5);
  const [result, setResult] =
    useState<ScenarioResult | null>(null);

  const [optimization, setOptimization] =
    useState<OptimizationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");


const [forecast, setForecast] =
  useState<ForecastResponse | null>(null);

const [plantConditions, setPlantConditions] =
  useState<PlantConditions | null>(null);

const [dataLoading, setDataLoading] = useState(true);
const [dataError, setDataError] = useState("");

useEffect(() => {
  let active = true;

  async function loadPlantConditions() {
    try {
      const [forecastResult, historyResult] = await Promise.all([
        fetchLatestForecast(),
        fetchMonitoringHistory(74171, 1),
      ]);

      if (!active) return;

      const observation = historyResult.observations[0];

      if (
        !observation ||
        observation.dissolved_oxygen === null ||
        observation.temperature === null ||
        observation.ammonium === null
      ) {
        throw new Error("Required historical sensor readings are unavailable.");
      }

      const conditions: PlantConditions = {
        dissolved_oxygen: observation.dissolved_oxygen,
        temperature: observation.temperature,
        ammonia: observation.ammonium,
        n2o_forecast: forecastResult.forecast,
      };

      setForecast(forecastResult);
      setPlantConditions(conditions);
      setTargetDO(
        Math.min(4, Math.max(0.5, conditions.dissolved_oxygen))
      );
      setDataError("");
    } catch (err) {
      if (!active) return;

      setDataError(
        err instanceof Error
          ? err.message
          : "Unable to load historical model inputs."
      );
    } finally {
      if (active) setDataLoading(false);
    }
  }

  loadPlantConditions();

  return () => {
    active = false;
  };
}, []);

const conditions = plantConditions ?? DEMO_CONDITIONS;


  async function runSimulation() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await simulateIntervention({
        ...conditions,
        proposed_do: targetDO,
      });

      setResult(data);
    } catch {
      setError(
        "Unable to connect to the simulation API. " +
        "Make sure your FastAPI server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runOptimization() {
    setOptimizing(true);
    setError("");

    try {
      const data = await optimizeInterventions(
        DEMO_CONDITIONS
      );

      setOptimization(data);
    } catch {
      setError("Unable to evaluate candidate scenarios.");
    } finally {
      setOptimizing(false);
    }
  }

  const demandChange = result
    ? (result.relative_aeration_demand - 1) * 100
    : null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#22e000] uppercase mb-2">
            Guardian / Intervention Lab
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Simulate before you act.
          </h1>

          <p className="text-[#969696] mt-2">
            Explore operating adjustments before applying
            changes to wastewater treatment systems.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#333] px-4 py-2 text-xs text-[#969696]">
          <FlaskConical size={14} />
          DEMO CONDITIONS
        </div>
      </header>

      
{/* Forecast alert */}
<div className="panel p-5 flex items-start gap-4">
  <div className="rounded-xl bg-[#22e000]/10 p-3 text-[#22e000]">
    <AlertTriangle size={22} />
  </div>

  <div>
    <p className="text-sm font-medium text-[#22e000]">
      {forecast
        ? `AI forecast: ${forecast.risk_level.replace("_", " ")}`
        : "Loading historical forecast"}
    </p>

    <p className="text-lg font-medium mt-1">
      {forecast
        ? `Predicted N₂O emission rate: ${forecast.forecast.toFixed(4)}`
        : "Historical AI model"}
    </p>

    <p className="text-sm text-[#969696] mt-1">
      {forecast
        ? `XGBoost prediction for ${forecast.forecast_time}. Explore hypothetical aeration adjustments below.`
        : "Retrieving model output and historical sensor readings."}
    </p>

    {dataError && (
      <p className="text-sm text-[#ffb454] mt-2">
        {dataError}
      </p>
    )}

    <p className="text-xs text-[#969696] mt-3">
      Historical demonstration only. The forecast model does not
      establish how an aeration adjustment would change N₂O emissions.
    </p>
  </div>
</div>


      {/* Baseline and proposed conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <section className="panel p-6">
          <p className="text-xs tracking-widest text-[#969696] mb-4">
            01 / BASELINE CONDITIONS
          </p>

          <h2 className="text-xl font-medium mb-6">
            Current plant state
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {[
                  {
                    label: "Dissolved oxygen",
                    value: conditions.dissolved_oxygen.toFixed(2),
                    unit: "reported",
                  },
                  {
                    label: "Temperature",
                    value: conditions.temperature.toFixed(2),
                    unit: "reported",
                  },
                  {
                    label: "Ammonia (NH₄)",
                    value: conditions.ammonia.toFixed(2),
                    unit: "reported",
                  },
                  {
                    label: "N₂O forecast",
                    value: conditions.n2o_forecast.toFixed(4),
                    unit: "reported",
                  },

            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl bg-[#080808] border border-[#252525] p-4"
              >
                <p className="text-xs text-[#969696]">
                  {metric.label}
                </p>

                <p className="text-2xl font-semibold mt-2">
                  {metric.value}
                  <span className="text-xs text-[#969696] ml-2">
                    {metric.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs tracking-widest text-[#969696]">
              02 / PROPOSED INTERVENTION
            </p>

            <SlidersHorizontal
              size={18}
              className="text-[#22e000]"
            />
          </div>

          <h2 className="text-xl font-medium">
            Adjust operating target
          </h2>

          <div className="mt-7">
            <p className="text-sm text-[#969696]">
              Proposed dissolved oxygen
            </p>

            <p className="text-5xl font-semibold text-[#22e000] mt-2">
              {targetDO.toFixed(1)}
              <span className="text-lg ml-2">mg/L</span>
            </p>

            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={targetDO}
              disabled={loading || dataLoading || !plantConditions}
              onChange={(event) => {
                setTargetDO(Number(event.target.value));
                setResult(null);
              }}
              className="w-full mt-6 accent-[#22e000] cursor-pointer"
            />

            <div className="flex justify-between text-xs text-[#969696] mt-2">
              <span>0.5 mg/L</span>
              <span>4.0 mg/L</span>
            </div>

            <div className="mt-5 flex justify-between text-sm">
              <span className="text-[#969696]">
                Setpoint adjustment
              </span>

              <span className="text-[#22e000]">
                {targetDO >= conditions.dissolved_oxygen ? "+" : ""}
                {(targetDO - conditions.dissolved_oxygen).toFixed(2)} mg/L
              </span>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#22e000] text-black font-semibold py-3 flex justify-center items-center gap-2 hover:bg-[#35f510] disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Evaluating scenario...
              </>
            ) : (
              <>
                Run Scenario
                <ArrowUpRight size={18} />
              </>
            )}
          </button>
        </section>
      </div>


      {/* Interactive Digital Twin */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <AerationTank
          targetDO={conditions.dissolved_oxygen}
          mode="monitoring"
        />

        <AerationTank
          targetDO={targetDO}
          relativeDemand={
            result?.relative_aeration_demand ?? null
          }
          mode="intervention"
        />

      </section>


      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Live simulation results */}
      {result && (
        <section className="panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-widest text-[#22e000] mb-2">
                LIVE SIMULATION RESULT
              </p>

              <h2 className="text-2xl font-medium">
                Scenario analysis
              </h2>
            </div>

            <FlaskConical
              className="text-[#22e000]"
              size={24}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#252525] bg-[#080808] p-5">
              <Zap
                size={20}
                className="text-[#22e000] mb-3"
              />

              <p className="text-sm text-[#969696]">
                Relative aeration demand
              </p>

              <p className="text-3xl font-semibold mt-2">
                {demandChange !== null &&
                demandChange >= 0
                  ? "+"
                  : ""}
                {demandChange?.toFixed(2)}%
              </p>

              <p className="text-xs text-[#969696] mt-2">
                Oxygen-transfer proxy vs. baseline
              </p>
            </div>

            <div className="rounded-xl border border-[#252525] bg-[#080808] p-5">
              <ShieldCheck
                size={20}
                className="text-[#22e000] mb-3"
              />

              <p className="text-sm text-[#969696]">
                Operating limits
              </p>

              <p
                className={`text-xl font-semibold mt-2 ${
                  result.within_demo_limits
                    ? "text-[#22e000]"
                    : "text-[#ffb454]"
                }`}
              >
                {result.within_demo_limits
                  ? "Within demo limits"
                  : "Outside demo limits"}
              </p>

              <p className="text-xs text-[#969696] mt-2">
                Not a plant safety certification
              </p>
            </div>

            <div className="rounded-xl border border-[#252525] bg-[#080808] p-5">
              <FlaskConical
                size={20}
                className="text-[#ffb454] mb-3"
              />

              <p className="text-sm text-[#969696]">
                N₂O reduction
              </p>

              <p className="text-xl font-semibold text-[#ffb454] mt-2">
                {result.n2o_reduction_percent === null
                  ? "Not yet evaluated"
                  : `${result.n2o_reduction_percent}%`}
              </p>

              <p className="text-xs text-[#969696] mt-2">
                Process-response validation required
              </p>
            </div>
          </div>

          {/* Demand comparison */}
          <div className="mt-6 rounded-xl bg-[#080808] border border-[#252525] p-5">
            <p className="text-sm font-medium mb-5">
              Oxygen-transfer demand comparison
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#969696]">
                    Baseline
                  </span>
                  <span>100%</span>
                </div>

                <div className="h-3 bg-[#252525] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#969696] rounded-full"
                    style={{
                      width: `${
                        100 /
                        Math.max(
                          1,
                          result.relative_aeration_demand
                        )
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#969696]">
                    Proposed
                  </span>
                  <span className="text-[#22e000]">
                    {(
                      result.relative_aeration_demand * 100
                    ).toFixed(2)}
                    %
                  </span>
                </div>

                <div className="h-3 bg-[#252525] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22e000] rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (result.relative_aeration_demand /
                          Math.max(
                            1,
                            result.relative_aeration_demand
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decision support */}
          <div className="mt-5 border border-[#22e000]/20 bg-[#22e000]/5 rounded-xl p-5">
            <p className="text-sm font-medium text-[#22e000] mb-2">
              Decision support
            </p>

            <p className="text-sm">
              {result.recommendation}
            </p>

            {result.violations.length > 0 && (
              <ul className="mt-3 space-y-2">
                {result.violations.map((violation) => (
                  <li
                    key={violation}
                    className="text-sm text-[#ffb454] flex items-center gap-2"
                  >
                    <AlertTriangle size={14} />
                    {violation}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-[#969696] mt-3">
              Effluent quality has not been verified.
              No physical equipment will be controlled.
            </p>
          </div>
        </section>
      )}

      {/* Candidate comparison */}
      <section className="panel p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-xs tracking-widest text-[#969696] mb-2">
              03 / SCENARIO EXPLORER
            </p>

            <h2 className="text-xl font-medium">
              Compare alternative strategies
            </h2>

            <p className="text-sm text-[#969696] mt-2">
              Screen five operating targets against
              configured demonstration constraints.
            </p>
          </div>

          <button
            onClick={runOptimization}
            disabled={optimizing || dataLoading || !plantConditions}
            className="rounded-xl border border-[#22e000]/40 text-[#22e000] px-5 py-3 text-sm font-medium flex items-center gap-2 hover:bg-[#22e000]/10 disabled:opacity-50"
          >
            {optimizing ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <SlidersHorizontal size={16} />
            )}

            {optimizing
              ? "Evaluating..."
              : "Compare Scenarios"}
          </button>
        </div>

        {optimization && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[#969696] border-b border-[#252525]">
                <tr>
                  <th className="py-3 pr-4">DO target</th>
                  <th className="py-3 pr-4">
                    Relative demand
                  </th>
                  <th className="py-3 pr-4">
                    Demo limits
                  </th>
                  <th className="py-3">
                    N₂O outcome
                  </th>
                </tr>
              </thead>

              <tbody>
                {optimization.scenarios.map((scenario) => (
                  <tr
                    key={scenario.proposed_do}
                    className="border-b border-[#252525]"
                  >
                    <td className="py-4 pr-4 font-medium">
                      {scenario.proposed_do.toFixed(2)} mg/L

                      {scenario.do_change === 0 && (
                        <span className="text-xs text-[#969696] ml-2">
                          Baseline
                        </span>
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      {(
                        scenario.relative_aeration_demand *
                        100
                      ).toFixed(2)}
                      %
                    </td>

                    <td className="py-4 pr-4">
                      {scenario.within_demo_limits ? (
                        <span className="flex items-center gap-2 text-[#22e000]">
                          <CheckCircle2 size={14} />
                          Pass
                        </span>
                      ) : (
                        <span className="text-[#ffb454]">
                          Outside limits
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-[#969696]">
                      Not evaluated
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-[#969696] mt-4">
              {optimization.message}
            </p>
          </div>
        )}
      </section>

      <p className="text-xs text-[#969696] pb-4">
        Research prototype · Illustrative plant inputs ·
        Simplified oxygen-transfer model · Human review required
      </p>
    </div>
  );
}