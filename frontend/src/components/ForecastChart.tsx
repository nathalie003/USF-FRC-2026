import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

import type { ForecastPoint } from "../types";

interface ForecastChartProps {
  data: ForecastPoint[];
  forecastValue?: number;
  forecastTime?: string;
  lastObservedTime?: string;
}

export default function ForecastChart({
  data,
  forecastValue,
  forecastTime,
  lastObservedTime,
}: ForecastChartProps) {
  const hasForecast =
    forecastValue !== undefined &&
    forecastTime !== undefined;

  return (
    <section className="panel p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-[#A8BFA4] mb-2">
            HISTORICAL TREND / N₂O
          </p>

          <h2 className="text-lg font-semibold text-white">
            Emission rate & forecast
          </h2>

          <p className="text-xs text-neutral-500 mt-1">
            Historical observations · XGBoost 30-minute forecast
          </p>
        </div>

        <span className="text-[10px] border border-neutral-800 rounded-full px-3 py-1.5 text-neutral-400">
          +30 MIN
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-5">
        <h3 className="text-2xl font-semibold text-white">
          {forecastValue !== undefined
            ? forecastValue.toFixed(4)
            : "—"}
        </h3>

        <span className="text-xs text-neutral-500">
          Predicted N₂O emission rate
        </span>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height={270}>
          <AreaChart
            data={data}
            margin={{ top: 12, right: 20, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="guardianFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8BFA4" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#A8BFA4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#294858"
              strokeDasharray="3 5"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#94A9B4", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />

            <YAxis
              tick={{ fill: "#94A9B4", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#102B3B",
                border: "1px solid #527D65",
                borderRadius: "2px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#aaa" }}
            />

            {lastObservedTime && (
              <ReferenceLine
                x={lastObservedTime}
                stroke="#666"
                strokeDasharray="4 4"
                label={{
                  value: "LAST OBSERVED",
                  position: "insideTopRight",
                  fill: "#888",
                  fontSize: 9,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="observed"
              name="Observed"
              stroke="#A8BFA4"
              strokeWidth={2}
              fill="url(#guardianFill)"
              connectNulls={false}
            />

            {hasForecast && (
              <ReferenceDot
                x={forecastTime}
                y={forecastValue}
                r={6}
                fill="#E6B66A"
                stroke="#ffffff"
                strokeWidth={1.5}
                label={{
                  value: "+30 MIN",
                  position: "top",
                  fill: "#E6B66A",
                  fontSize: 10,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-5 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.5 bg-[#A8BFA4]" />
          <span className="text-xs text-neutral-400">
            Historical observations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E6B66A]" />
          <span className="text-xs text-neutral-400">
            XGBoost +30-minute prediction
          </span>
        </div>
      </div>

      <p className="text-[10px] text-neutral-600 mt-4">
        Historical replay · Reported units are unverified ·
        Demonstration forecast · Not for operational control
      </p>
    </section>
  );
}