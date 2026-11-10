
import {
  Activity,
  AlertTriangle,
  Waves,
  Cpu,
  CalendarDays,
} from "lucide-react";

import MetricCard from "../components/MetricCard";
import ForecastChart from "../components/ForecastChart";
import AerationTank from "../components/AerationTank";
import RiskAlert from "../components/RiskAlert";

import type { ForecastPoint } from "../types";

const forecastData: ForecastPoint[] = [
  { time: "10:00", observed: 0.22 },
  { time: "10:05", observed: 0.25 },
  { time: "10:10", observed: 0.23 },
  { time: "10:15", observed: 0.31 },
  { time: "10:20", observed: 0.35 },
  { time: "10:25", observed: 0.42, forecast: 0.42 },
  { time: "10:30", forecast: 0.48 },
  { time: "10:35", forecast: 0.57 },
  { time: "10:40", forecast: 0.68 },
  { time: "10:45", forecast: 0.74 },
  { time: "10:50", forecast: 0.78 },
  { time: "10:55", forecast: 0.81 },
];

export default function Overview() {
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

      {/* Main heading */}
      <header className="py-3">
        <p className="text-[10px] text-[#22e000] tracking-[0.25em] font-semibold mb-3">
          INTELLIGENT WASTEWATER SYSTEMS
        </p>

        <h1 className="text-4xl lg:text-5xl font-medium text-white tracking-tight">
          Plant intelligence.
        </h1>

        <p className="text-neutral-500 text-sm mt-3">
          Anticipate emissions. Optimize operations. Protect the environment.
        </p>
      </header>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="N₂O sensor index"
          value="0.42"
          subtitle="Illustrative reading"
          icon={Activity}
          color="text-white"
        />

        <MetricCard
          title="30-minute forecast risk"
          value="Elevated"
          subtitle="Example AI alert"
          icon={AlertTriangle}
          color="text-[#ffb454]"
        />

        <MetricCard
          title="Dissolved oxygen"
          value="2.0 mg/L"
          subtitle="Example measurement"
          icon={Waves}
          color="text-white"
        />

        <MetricCard
          title="System connection"
          value="Demo"
          subtitle="Virtual aeration available"
          icon={Cpu}
          color="text-[#22e000]"
        />
      </div>

      {/* Forecast and digital twin */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <ForecastChart data={forecastData} />
        <AerationTank />
      </div>

      {/* AI intervention */}
      <RiskAlert />

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-4 pb-2">
        <p className="text-[10px] text-neutral-600">
          N₂O Guardian © 2026 · NSBE AI Impact-A-Thon
        </p>

        <p className="text-[10px] text-neutral-600">
          Prototype environment · Not for operational plant control
        </p>
      </footer>
    </div>
  );
}