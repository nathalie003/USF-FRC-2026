
import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  Droplets,
  FlaskConical,
  Thermometer,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  fetchMonitoringHistory,
  fetchMonitoringSummary,
  type MonitoringObservation,
  type MonitoringSummaryResponse,
} from "../services/api";

type WindowSize = 30 | 60 | 120 | 240;

const WINDOWS: WindowSize[] = [30, 60, 120, 240];

function formatTime(value: string) {
  return value.replace("T", " ").slice(0, 16);
}

function formatValue(value: number | null, digits = 2) {
  return value === null ? "—" : value.toFixed(digits);
}

export default function Monitoring() {
  const [observations, setObservations] = useState<
    MonitoringObservation[]
  >([]);

  const [summary, setSummary] =
    useState<MonitoringSummaryResponse | null>(null);

  const [offset, setOffset] = useState(0);
  const [windowSize, setWindowSize] = useState<WindowSize>(120);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchMonitoringSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Summary unavailable."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchMonitoringHistory(offset, windowSize)
      .then((data) => {
        if (!cancelled) {
          setObservations(data.observations);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load historical observations."
          );
          setObservations([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [offset, windowSize, refreshKey]);

  const latest = observations.at(-1) ?? null;

  const metrics = [
    {
      label: "Dissolved oxygen",
      value: formatValue(latest?.dissolved_oxygen ?? null),
      icon: Droplets,
      color: "#22e000",
    },
    {
      label: "Temperature",
      value: formatValue(latest?.temperature ?? null),
      icon: Thermometer,
      color: "#a8f08a",
    },
    {
      label: "Ammonium (NH₄)",
      value: formatValue(latest?.ammonium ?? null),
      icon: FlaskConical,
      color: "#8bc5ff",
    },
    {
      label: "N₂O emission rate",
      value: formatValue(latest?.n2o_emission_rate ?? null),
      icon: Activity,
      color: "#ffb454",
    },
  ];

  const total = summary?.total_observations ?? 0;
  const canGoBack = offset > 0;
  const canGoForward = total > 0 && offset + windowSize < total;

  const firstVisible = observations[0]?.time;
  const lastVisible = latest?.time;

  const chartData = observations.map((row) => ({
    ...row,
    label: row.time.replace("T", " ").slice(5, 16),
  }));

  const moveWindow = (direction: -1 | 1) => {
    const next = offset + direction * windowSize;
    setOffset(Math.max(0, Math.min(next, Math.max(0, total - 1))));
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#22e000] uppercase mb-2">
            Guardian / Monitoring
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Plant telemetry.
          </h1>

          <p className="text-[#969696] mt-2">
            Explore recorded wastewater conditions and
            historical N₂O emissions.
          </p>
        </div>

        <span className="flex items-center gap-2 border border-[#333] rounded-full px-4 py-2 text-xs text-[#969696]">
          <Database size={14} />
          HISTORICAL DATA
        </span>
      </header>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#969696] mb-1">
              Historical dataset
            </p>

            <p className="text-lg font-semibold">
              {summary
                ? `${summary.total_observations.toLocaleString()} observations`
                : "Loading dataset..."}
            </p>

            <p className="text-xs text-[#777] mt-1">
              {summary
                ? `${formatTime(summary.first_timestamp)} — ${formatTime(summary.last_timestamp)}`
                : "Checking data coverage"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="flex items-center gap-2 rounded-lg border border-[#333] px-4 py-2 text-sm hover:border-[#22e000] transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#969696]">
                  {metric.label}
                </p>

                <Icon size={18} style={{ color: metric.color }} />
              </div>

              <div className="mt-5">
                <span className="text-3xl font-semibold">
                  {loading ? "..." : metric.value}
                </span>
              </div>

              <p className="text-xs text-[#777] mt-3">
                Latest value in selected window
              </p>

              <p className="text-[11px] text-[#777] mt-1">
                Units not verified
              </p>
            </div>
          );
        })}
      </div>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] tracking-widest text-[#22e000] mb-2">
              HISTORICAL REPLAY
            </p>

            <h2 className="text-xl font-semibold">
              Process conditions
            </h2>

            <p className="text-sm text-[#969696] mt-1">
              Navigate through recorded observations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {WINDOWS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setWindowSize(size);
                  setOffset(0);
                }}
                className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                  windowSize === size
                    ? "bg-[#22e000] border-[#22e000] text-black font-semibold"
                    : "border-[#333] text-[#969696] hover:text-white"
                }`}
              >
                {size} readings
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-xs text-[#969696]">
            {firstVisible && lastVisible
              ? `${formatTime(firstVisible)} → ${formatTime(lastVisible)}`
              : "No observations selected"}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canGoBack || loading}
              onClick={() => moveWindow(-1)}
              className="flex items-center gap-1 rounded-lg border border-[#333] px-3 py-2 text-xs disabled:opacity-30 hover:border-[#22e000]"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <button
              type="button"
              disabled={!canGoForward || loading}
              onClick={() => moveWindow(1)}
              className="flex items-center gap-1 rounded-lg border border-[#333] px-3 py-2 text-xs disabled:opacity-30 hover:border-[#22e000]"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                stroke="#252525"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#777"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                minTickGap={30}
              />

              <YAxis
                stroke="#969696"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #333",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="dissolved_oxygen"
                name="Dissolved oxygen"
                stroke="#22e000"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="ammonium"
                name="Ammonium"
                stroke="#8bc5ff"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="nitrate"
                name="Nitrate"
                stroke="#b2ff9d"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-[#777] mt-4">
          Recorded historical values. Measurement units have
          not yet been verified from the original dataset.
        </p>
      </section>

      <section className="panel p-6">
        <div className="mb-6">
          <p className="text-[10px] tracking-widest text-[#ffb454] mb-2">
            N₂O ANALYTICS
          </p>

          <h2 className="text-xl font-semibold">
            Recorded N₂O emission rate
          </h2>

          <p className="text-sm text-[#969696] mt-1">
            Historical emissions signal for the selected window.
          </p>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                stroke="#252525"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#777"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                minTickGap={30}
              />

              <YAxis
                stroke="#969696"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #333",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />

              <Line
                type="monotone"
                dataKey="n2o_emission_rate"
                name="Recorded N₂O emission rate"
                stroke="#ffb454"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-[#777] mt-4">
          Emission-rate units and calibration are not yet
          verified. This chart does not represent a model
          prediction or a validated intervention outcome.
        </p>
      </section>

      <section className="panel p-5">
        <div className="flex gap-3">
          <AlertTriangle
            size={20}
            className="text-[#ffb454] shrink-0"
          />

          <div>
            <h3 className="font-semibold text-sm">
              Research dataset limitations
            </h3>

            <p className="text-sm text-[#969696] mt-2 leading-relaxed">
              These readings are historical observations,
              not live sensor data. Measurement units and
              sensor calibration remain unverified. The
              dataset supports forecasting research but
              does not establish how N₂O emissions respond
              to changes in aeration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}