
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
      color: "#A8BFA4",
    },
    {
      label: "Temperature",
      value: formatValue(latest?.temperature ?? null),
      icon: Thermometer,
      color: "#A8BFA4",
    },
    {
      label: "Ammonium (NH₄)",
      value: formatValue(latest?.ammonium ?? null),
      icon: FlaskConical,
      color: "#8FAFBD",
    },
    {
      label: "N₂O emission rate",
      value: formatValue(latest?.n2o_emission_rate ?? null),
      icon: Activity,
      color: "#D8B580",
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
    <div className="workspace-page space-y-6 pb-8">
      <header className="page-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.12em] text-[#A8BFA4] uppercase mb-2">
            PROCESS MONITORING / 02
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Historical process monitoring
          </h1>

          <p className="text-[#A3B5BF] mt-2">
            Explore recorded wastewater conditions and
            historical N₂O emissions.
          </p>
        </div>

        <span className="flex items-center gap-2 border border-[#344957] rounded-full px-4 py-2 text-xs text-[#A3B5BF]">
          <Database size={14} />
          HISTORICAL DATA
        </span>
      </header>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#A3B5BF] mb-1">
              Historical dataset
            </p>

            <p className="text-lg font-semibold">
              {summary
                ? `${summary.total_observations.toLocaleString()} observations`
                : "Loading dataset..."}
            </p>

            <p className="text-xs text-[#94A9B4] mt-1">
              {summary
                ? `${formatTime(summary.first_timestamp)} — ${formatTime(summary.last_timestamp)}`
                : "Checking data coverage"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="flex items-center gap-2 rounded-md border border-[#344957] px-4 py-2 text-sm hover:border-[#A8BFA4] transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#A3B5BF]">
                  {metric.label}
                </p>

                <Icon size={18} style={{ color: metric.color }} />
              </div>

              <div className="mt-5">
                <span className="text-3xl font-semibold">
                  {loading ? "..." : metric.value}
                </span>
              </div>

              <p className="text-xs text-[#94A9B4] mt-3">
                Latest value in selected window
              </p>

              <p className="text-[11px] text-[#94A9B4] mt-1">
                Units not verified
              </p>
            </div>
          );
        })}
      </div>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] tracking-widest text-[#A8BFA4] mb-2">
              HISTORICAL REPLAY
            </p>

            <h2 className="text-xl font-semibold">
              Process conditions
            </h2>

            <p className="text-sm text-[#A3B5BF] mt-1">
              Navigate through recorded observations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {WINDOWS.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={windowSize === size}
                onClick={() => {
                  setWindowSize(size);
                  setOffset(0);
                }}
                className={`px-3 py-2 rounded-md text-xs border transition-colors ${
                  windowSize === size
                    ? "bg-[#A8BFA4] border-[#A8BFA4] text-black font-semibold"
                    : "border-[#344957] text-[#A3B5BF] hover:text-white"
                }`}
              >
                {size} readings
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-xs text-[#A3B5BF]">
            {firstVisible && lastVisible
              ? `${formatTime(firstVisible)} → ${formatTime(lastVisible)}`
              : "No observations selected"}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canGoBack || loading}
              onClick={() => moveWindow(-1)}
              className="flex items-center gap-1 rounded-md border border-[#344957] px-3 py-2 text-xs disabled:opacity-30 hover:border-[#A8BFA4]"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <button
              type="button"
              disabled={!canGoForward || loading}
              onClick={() => moveWindow(1)}
              className="flex items-center gap-1 rounded-md border border-[#344957] px-3 py-2 text-xs disabled:opacity-30 hover:border-[#A8BFA4]"
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
                stroke="#29404E"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#94A9B4"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                minTickGap={30}
              />

              <YAxis
                stroke="#A3B5BF"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#102633",
                  border: "1px solid #344957",
                  borderRadius: 4,
                  color: "#fff",
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="dissolved_oxygen"
                name="Dissolved oxygen"
                stroke="#A8BFA4"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="ammonium"
                name="Ammonium"
                stroke="#8FAFBD"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="nitrate"
                name="Nitrate"
                stroke="#C0CBB1"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-[#94A9B4] mt-4">
          Recorded historical values. Measurement units have
          not yet been verified from the original dataset.
        </p>
      </section>

      <section className="panel p-6">
        <div className="mb-6">
          <p className="text-[10px] tracking-widest text-[#D8B580] mb-2">
            N₂O ANALYTICS
          </p>

          <h2 className="text-xl font-semibold">
            Recorded N₂O emission rate
          </h2>

          <p className="text-sm text-[#A3B5BF] mt-1">
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
                stroke="#29404E"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#94A9B4"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                minTickGap={30}
              />

              <YAxis
                stroke="#A3B5BF"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#102633",
                  border: "1px solid #344957",
                  borderRadius: 4,
                  color: "#fff",
                }}
              />

              <Line
                type="monotone"
                dataKey="n2o_emission_rate"
                name="Recorded N₂O emission rate"
                stroke="#D8B580"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-[#94A9B4] mt-4">
          Emission-rate units and calibration are not yet
          verified. This chart does not represent a model
          prediction or a validated intervention outcome.
        </p>
      </section>

      <section className="panel p-5">
        <div className="flex gap-3">
          <AlertTriangle
            size={20}
            className="text-[#D8B580] shrink-0"
          />

          <div>
            <h3 className="font-semibold text-sm">
              Research dataset limitations
            </h3>

            <p className="text-sm text-[#A3B5BF] mt-2 leading-relaxed">
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