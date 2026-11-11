
import { useState } from "react";
import {
  Activity,
  Thermometer,
  Droplets,
  FlaskConical,
  Radio,
  Database,
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

type Range = "30m" | "1h" | "6h";

const demoData = Array.from({ length: 25 }, (_, i) => {
  const minutes = i * 5;

  return {
    time: `${String(9 + Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
    dissolvedOxygen: Number(
      (2 + Math.sin(i * 0.42) * 0.24 + i * 0.006).toFixed(2)
    ),
    temperature: Number(
      (20 + Math.sin(i * 0.2) * 0.55).toFixed(2)
    ),
    ammonia: Number(
      (3.5 + Math.cos(i * 0.35) * 0.35).toFixed(2)
    ),
    n2oIndex: Number(
      (0.3 + i * 0.012 + Math.sin(i * 0.55) * 0.08).toFixed(3)
    ),
  };
});

const metrics = [
  {
    label: "Dissolved oxygen",
    value: "2.0",
    unit: "mg/L",
    icon: Droplets,
    key: "dissolvedOxygen",
  },
  {
    label: "Temperature",
    value: "20.0",
    unit: "°C",
    icon: Thermometer,
    key: "temperature",
  },
  {
    label: "Ammonia",
    value: "3.5",
    unit: "mg/L",
    icon: FlaskConical,
    key: "ammonia",
  },
  {
    label: "N₂O risk index",
    value: "0.42",
    unit: "demo",
    icon: Activity,
    key: "n2oIndex",
  },
] as const;

const sensors = [
  { name: "Dissolved oxygen", unit: "mg/L" },
  { name: "Temperature", unit: "°C" },
  { name: "Ammonia", unit: "mg/L" },
  { name: "N₂O index", unit: "demo" },
];

export default function Monitoring() {
  const [range, setRange] = useState<Range>("1h");

  const visibleData =
    range === "30m"
      ? demoData.slice(-7)
      : range === "1h"
        ? demoData.slice(-13)
        : demoData;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#22e000] uppercase mb-2">
            Guardian / Monitoring
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Plant telemetry.
          </h1>

          <p className="text-[#969696] mt-2">
            Understand process conditions and emerging
            emissions risks.
          </p>
        </div>

        <span className="flex items-center gap-2 border border-[#333] rounded-full px-4 py-2 text-xs text-[#969696]">
          <Database size={14} />
          ILLUSTRATIVE DATA
        </span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.key} className="panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#969696]">
                  {metric.label}
                </p>

                <Icon size={17} className="text-[#22e000]" />
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold">
                  {metric.value}
                </span>

                <span className="text-xs text-[#969696]">
                  {metric.unit}
                </span>
              </div>

              <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoData}>
                    <Line
                      type="monotone"
                      dataKey={metric.key}
                      stroke="#22e000"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-[#777] mt-2">
                Sample historical trend
              </p>
            </div>
          );
        })}
      </div>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] tracking-widest text-[#22e000] mb-2">
              PROCESS ANALYTICS
            </p>

            <h2 className="text-xl font-semibold">
              Historical process trends
            </h2>

            <p className="text-sm text-[#969696] mt-1">
              Explore example wastewater process readings.
            </p>
          </div>

          <div className="flex gap-1 bg-[#080808] border border-[#252525] rounded-lg p-1">
            {(["30m", "1h", "6h"] as Range[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={`px-4 py-2 rounded-md text-xs transition-colors ${
                  range === option
                    ? "bg-[#22e000] text-black font-semibold"
                    : "text-[#969696] hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visibleData}
              margin={{ top: 12, right: 18, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                stroke="#252525"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                stroke="#777"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <YAxis
                yAxisId="process"
                stroke="#22e000"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                domain={[0, 5]}
                label={{
                  value: "DO / Ammonia (mg/L)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#969696",
                  fontSize: 10,
                }}
              />

              <YAxis
                yAxisId="risk"
                orientation="right"
                stroke="#ffb454"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                domain={[0, 1]}
                label={{
                  value: "N₂O index",
                  angle: 90,
                  position: "insideRight",
                  fill: "#969696",
                  fontSize: 10,
                }}
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
                yAxisId="process"
                dataKey="dissolvedOxygen"
                name="Dissolved oxygen (mg/L)"
                stroke="#22e000"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                yAxisId="process"
                dataKey="ammonia"
                name="Ammonia (mg/L)"
                stroke="#b2ff9d"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                yAxisId="risk"
                dataKey="n2oIndex"
                name="N₂O index (demo)"
                stroke="#ffb454"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-[#777] mt-4">
          Synthetic demonstration readings. N₂O index is
          dimensionless and does not represent measured
          emissions or a validated risk probability.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="panel p-6">
          <div className="flex items-center gap-3 mb-5">
            <Radio size={19} className="text-[#22e000]" />

            <h2 className="text-lg font-semibold">
              Sensor network
            </h2>
          </div>

          <div className="space-y-4">
            {sensors.map((sensor) => (
              <div
                key={sensor.name}
                className="flex justify-between items-center border-b border-[#252525] pb-3"
              >
                <div>
                  <p className="text-sm">{sensor.name}</p>
                  <p className="text-xs text-[#777] mt-1">
                    Unit: {sensor.unit}
                  </p>
                </div>

                <span className="text-xs text-[#ffb454]">
                  DEMO SOURCE
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle
              size={19}
              className="text-[#ffb454]"
            />

            <h2 className="text-lg font-semibold">
              Monitoring insights
            </h2>
          </div>

          <div className="rounded-xl border border-[#ffb454]/20 bg-[#ffb454]/5 p-4">
            <p className="text-sm font-medium text-[#ffb454]">
              Illustrative elevated N₂O trend
            </p>

            <p className="text-sm text-[#969696] mt-2">
              The sample data demonstrates how Guardian
              could highlight changing N₂O conditions
              alongside dissolved oxygen and ammonia.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-[#252525] p-4">
            <p className="text-sm font-medium">
              Forecast integration
            </p>

            <p className="text-sm text-[#969696] mt-2">
              Historical readings are currently synthetic.
              Forecasting and live sensor connections are
              not yet available.
            </p>
          </div>
        </section>
      </div>

      <p className="text-xs text-[#777] pb-4">
        Guardian research prototype · Synthetic telemetry ·
        No live plant sensors connected
      </p>
    </div>
  );
}