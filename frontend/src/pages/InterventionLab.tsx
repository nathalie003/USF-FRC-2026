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
    // Arduino hardware demonstration
  const [hardwareBusy, setHardwareBusy] = useState(false);
  const [hardwareMessage, setHardwareMessage] = useState("");

  async function runHardwareDemo() {
    setHardwareBusy(true);
    setHardwareMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/hardware/run",
        { method: "POST" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Hardware demo failed");
      }

      setHardwareMessage("Arduino demo completed successfully.");
    } catch (error) {
      setHardwareMessage(
        error instanceof Error ? error.message : "Connection failed"
      );
    } finally {
      setHardwareBusy(false);
    }
  }
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

  async function loadPlantConditions() {;
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
      setOptimization(null);
      setResult(null);
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
  setOptimization(null);
  setOptimizing(true);
  setError("");

  try {
    const data = await optimizeInterventions(
      conditions
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
    <div className="workspace-page space-y-6">

      {/* Header */}
      <header className="page-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.12em] text-[#A8BFA4] uppercase mb-2">
            SCENARIO ANALYSIS / 03
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Aeration scenario evaluation
          </h1>

          <p className="text-[#A3B5BF] mt-2">
            Evaluate hypothetical aeration targets against demonstration operating constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#344957] px-4 py-2 text-xs text-[#A3B5BF]">
          <FlaskConical size={14} />
          DEMO CONDITIONS
        </div>
      </header>

      
{/* Forecast alert */}
<div className="panel p-5 flex items-start gap-4">
  <div className="rounded-md bg-[#A8BFA4]/10 p-3 text-[#A8BFA4]">
    <AlertTriangle size={22} />
  </div>

  <div>
    <p className="text-sm font-medium text-[#A8BFA4]">
      {forecast
        ? `XGBoost risk classification: ${forecast.risk_level.replace("_", " ")}`
        : "Loading historical forecast"}
    </p>

    <p className="text-lg font-medium mt-1">
      {forecast
        ? `Predicted N₂O emission rate: ${forecast.forecast.toFixed(4)}`
        : "Historical XGBoost model"}
    </p>

    <p className="text-sm text-[#A3B5BF] mt-1">
      {forecast
        ? `XGBoost prediction for ${forecast.forecast_time}. Explore hypothetical aeration adjustments below.`
        : "Retrieving model output and historical sensor readings."}
    </p>

    {dataError && (
      <p className="text-sm text-[#D8B580] mt-2">
        {dataError}
      </p>
    )}

    <p className="text-xs text-[#A3B5BF] mt-3">
      Historical demonstration only. The forecast model does not
      establish how an aeration adjustment would change N₂O emissions.
    </p>
  </div>
</div>


      {/* Baseline and proposed conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <section className="panel p-6">
          <p className="text-xs tracking-widest text-[#A3B5BF] mb-4">
            01 / BASELINE CONDITIONS
          </p>

          <h2 className="text-xl font-medium mb-6">
            Historical baseline conditions
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {[
                  {
                    label: "Dissolved oxygen",
                    value: conditions.dissolved_oxygen.toFixed(2),
                    unit: "units unverified",
                  },
                  {
                    label: "Temperature",
                    value: conditions.temperature.toFixed(2),
                    unit: "units unverified",
                  },
                  {
                    label: "Ammonia (NH₄)",
                    value: conditions.ammonia.toFixed(2),
                    unit: "units unverified",
                  },
                  {
                    label: "N₂O forecast",
                    value: conditions.n2o_forecast.toFixed(4),
                    unit: "units unverified",
                  },

            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-md bg-[#0C2230] border border-[#29404E] p-4"
              >
                <p className="text-xs text-[#A3B5BF]">
                  {metric.label}
                </p>

                <p className="text-2xl font-semibold mt-2">
                  {metric.value}
                  <span className="text-xs text-[#A3B5BF] ml-2">
                    {metric.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs tracking-widest text-[#A3B5BF]">
              02 / PROPOSED INTERVENTION
            </p>

            <SlidersHorizontal
              size={18}
              className="text-[#A8BFA4]"
            />
          </div>

          <h2 className="text-xl font-medium">
            Adjust operating target
          </h2>

          <div className="mt-7">
            <p className="text-sm text-[#A3B5BF]">
              Proposed dissolved oxygen
            </p>

            <p className="text-3xl font-semibold text-[#A8BFA4] mt-2">
              {targetDO.toFixed(2)}
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
              aria-label="Proposed dissolved oxygen target in milligrams per litre"
              className="w-full mt-6 accent-[#A8BFA4] cursor-pointer"
            />

            <div className="flex justify-between text-xs text-[#A3B5BF] mt-2">
              <span>0.5 mg/L</span>
              <span>4.0 mg/L</span>
            </div>

            <div className="mt-5 flex justify-between text-sm">
              <span className="text-[#A3B5BF]">
                Setpoint adjustment
              </span>

              <span className="text-[#A8BFA4]">
                {targetDO >= conditions.dissolved_oxygen ? "+" : ""}
                {(targetDO - conditions.dissolved_oxygen).toFixed(2)} mg/L
              </span>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="mt-6 w-full rounded-md bg-[#A8BFA4] text-black font-semibold py-3 flex justify-center items-center gap-2 hover:bg-[#BDD0B7] disabled:opacity-50 transition-colors"
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

          <div className="mt-4 rounded-md border border-[#315566] bg-[#102d3d] p-4">
  <p className="mb-3 text-xs font-semibold text-[#A8BFA4]">
    ARDUINO HARDWARE DEMONSTRATION
  </p>

  <button
    type="button"
    onClick={runHardwareDemo}
    disabled={hardwareBusy}
    className="w-full rounded-md bg-[#A8BFA4] px-5 py-3 font-semibold text-[#082333] transition hover:bg-[#BDD0B7] disabled:opacity-50"
  >
    {hardwareBusy ? "Running Arduino..." : "Run Arduino Demo"}
  </button>

  {hardwareMessage && (
    <p className="mt-3 text-sm text-[#A8BFA4]">
      {hardwareMessage}
    </p>
  )}

  <p className="mt-3 text-xs text-neutral-400">
    Arduino demonstration only. No physical wastewater equipment is controlled.
  </p>
</div> 
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
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Live simulation results */}
      {result && (
        <section className="panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-widest text-[#A8BFA4] mb-2">
                SCENARIO ANALYSIS
              </p>

              <h2 className="text-2xl font-medium">
                Scenario analysis
              </h2>
            </div>

            <FlaskConical
              className="text-[#A8BFA4]"
              size={24}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-md border border-[#29404E] bg-[#0C2230] p-5">
              <Zap
                size={20}
                className="text-[#A8BFA4] mb-3"
              />

              <p className="text-sm text-[#A3B5BF]">
                Relative aeration demand
              </p>

              <p className="text-3xl font-semibold mt-2">
                {demandChange !== null &&
                demandChange >= 0
                  ? "+"
                  : ""}
                {demandChange?.toFixed(2)}%
              </p>

              <p className="text-xs text-[#A3B5BF] mt-2">
                Oxygen-transfer proxy vs. baseline
              </p>
            </div>

            <div className="rounded-md border border-[#29404E] bg-[#0C2230] p-5">
              <ShieldCheck
                size={20}
                className="text-[#A8BFA4] mb-3"
              />

              <p className="text-sm text-[#A3B5BF]">
                Operating limits
              </p>

              <p
                className={`text-xl font-semibold mt-2 ${
                  result.within_demo_limits
                    ? "text-[#A8BFA4]"
                    : "text-[#D8B580]"
                }`}
              >
                {result.within_demo_limits
                  ? "Within demo limits"
                  : "Outside demo limits"}
              </p>

              <p className="text-xs text-[#A3B5BF] mt-2">
                Not a plant safety certification
              </p>
            </div>

            <div className="rounded-md border border-[#29404E] bg-[#0C2230] p-5">
              <FlaskConical
                size={20}
                className="text-[#D8B580] mb-3"
              />

              <p className="text-sm text-[#A3B5BF]">
                N₂O reduction
              </p>

              <p className="text-xl font-semibold text-[#D8B580] mt-2">
                {result.n2o_reduction_percent === null
                  ? "Not yet evaluated"
                  : `${result.n2o_reduction_percent}%`}
              </p>

              <p className="text-xs text-[#A3B5BF] mt-2">
                Process-response validation required
              </p>
            </div>
          </div>

          {/* Demand comparison */}
          <div className="mt-6 rounded-md bg-[#0C2230] border border-[#29404E] p-5">
            <p className="text-sm font-medium mb-5">
              Oxygen-transfer demand comparison
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#A3B5BF]">
                    Baseline
                  </span>
                  <span>100%</span>
                </div>

                <div className="h-3 bg-[#29404E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A3B5BF] rounded-full"
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
                  <span className="text-[#A3B5BF]">
                    Proposed
                  </span>
                  <span className="text-[#A8BFA4]">
                    {(
                      result.relative_aeration_demand * 100
                    ).toFixed(2)}
                    %
                  </span>
                </div>

                <div className="h-3 bg-[#29404E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A8BFA4] rounded-full transition-all duration-500"
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
          <div className="mt-5 border border-[#A8BFA4]/20 bg-[#A8BFA4]/5 rounded-md p-5">
            <p className="text-sm font-medium text-[#A8BFA4] mb-2">
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
                    className="text-sm text-[#D8B580] flex items-center gap-2"
                  >
                    <AlertTriangle size={14} />
                    {violation}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-[#A3B5BF] mt-3">
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
            <p className="text-xs tracking-widest text-[#A3B5BF] mb-2">
              03 / SCENARIO EXPLORER
            </p>

            <h2 className="text-xl font-medium">
              Compare operating targets
            </h2>

            <p className="text-sm text-[#A3B5BF] mt-2">
              Screen five operating targets against
              configured demonstration constraints.
            </p>
          </div>

          <button
            onClick={runOptimization}
            disabled={optimizing || dataLoading || !plantConditions}
            className="rounded-md border border-[#A8BFA4]/40 text-[#A8BFA4] px-5 py-3 text-sm font-medium flex items-center gap-2 hover:bg-[#A8BFA4]/10 disabled:opacity-50"
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
              <thead className="text-[#A3B5BF] border-b border-[#29404E]">
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
                    className="border-b border-[#29404E]"
                  >
                    <td className="py-4 pr-4 font-medium">
                      {scenario.proposed_do.toFixed(2)} mg/L

                      {scenario.do_change === 0 && (
                        <span className="text-xs text-[#A3B5BF] ml-2">
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
                        <span className="flex items-center gap-2 text-[#A8BFA4]">
                          <CheckCircle2 size={14} />
                          Pass
                        </span>
                      ) : (
                        <span className="text-[#D8B580]">
                          Outside limits
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-[#A3B5BF]">
                      Not evaluated
                    </td>
                  </tr>
                ))}
              
              </tbody>
            </table>

            {optimization.eligible_scenarios === 0 && (
              <div className="mt-5 rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-amber-400">
                      No eligible intervention identified
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                      Historical dissolved oxygen conditions fall outside
                      the configured demonstration operating range.
                      All candidate adjustments require further
                      engineering review.
                    </p>

                    <p className="mt-2 text-[11px] text-neutral-500">
                      No validated N₂O reduction recommendation is available.
                      Human review is required before any operational changes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-[#A3B5BF] mt-4">
              {optimization.message}
            </p>

          </div>
        )}
      </section>

      <p className="text-xs text-[#A3B5BF] pb-4">
        Research prototype · Historical inputs / demonstration fallback ·
        Simplified oxygen-transfer model · Human review required
      </p>
    </div>
  );
}