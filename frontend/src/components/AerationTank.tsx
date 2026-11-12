
import { useState } from "react";
import { Activity, Pause, Play, Wind } from "lucide-react";

interface AerationTankProps {
  oxygen?: number;
  proposedDo?: number;
  targetDO?: number;
  relativeDemand?: number | null;
  mode?: string;
  title?: string;
  subtitle?: string;
}

export default function AerationTank({
  oxygen = 2.0,
  proposedDo,
  targetDO,
  relativeDemand,
  mode = "baseline",
  title,
  subtitle = "Illustrative virtual process visualization",
}: AerationTankProps) {
  const [running, setRunning] = useState(true);

  const displayedOxygen = targetDO ?? proposedDo ?? oxygen;

  const displayTitle =
    title ??
    (mode === "proposed"
      ? "Proposed aeration basin"
      : "Baseline aeration basin");

  return (
    <section className="panel flex h-full flex-col p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[#A8BFA4]">
            PROCESS SCHEMATIC / 01
          </p>
          <h2 className="text-lg font-semibold text-[#F2F0E8]">
            {displayTitle}
          </h2>
          <p className="mt-1 text-xs text-[#9BAEB6]">
            {subtitle}
          </p>
        </div>

        <span className="rounded-full border border-[#527D65]/40 px-3 py-1 text-[10px] text-[#A8BFA4]">
          SIMULATED
        </span>
      </div>

      <div className="relative overflow-hidden rounded-md border border-[#294858] bg-[#0B2230]">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(#527D6520 1px, transparent 1px), linear-gradient(90deg, #527D6520 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <svg
          viewBox="0 0 600 260"
          className="relative h-auto w-full"
          role="img"
          aria-label="Illustrative animated wastewater aeration tank"
        >
          <defs>
            <linearGradient id="guardianWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#527D65" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#123344" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <path
            d="M160 105 L220 65 L420 65 L480 105 L480 205 L420 240 L220 240 L160 205 Z"
            fill="#163D43"
            stroke="#789A91"
            strokeWidth="2"
          />

          <path
            d="M160 105 L220 65 L420 65 L480 105 L420 145 L220 145 Z"
            fill="#315F58"
            stroke="#A8BFA4"
            strokeWidth="1.5"
          />

          <path
            d="M160 105 L220 145 L220 240 L160 205 Z"
            fill="#204A4A"
            opacity="0.9"
          />

          <path
            d="M220 145 L420 145 L480 105 L480 205 L420 240 L220 240 Z"
            fill="url(#guardianWater)"
          />

          <path
            d="M220 145 L420 145 L480 105"
            fill="none"
            stroke="#A8BFA4"
            strokeOpacity="0.5"
          />

          <path
            d="M200 210 L440 210"
            stroke="#A8BFA4"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {Array.from({ length: 12 }, (_, index) => {
            const x = 235 + (index % 6) * 37;
            const y = 195 - Math.floor(index / 6) * 25;
            const duration = 2 + (index % 4) * 0.35;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={3 + (index % 3)}
                fill="none"
                stroke="#A8BFA4"
                strokeWidth="1.5"
                opacity={running ? 0.8 : 0.35}
                style={
                  running
                    ? {
                        animation: `bubble-rise ${duration}s ease-in infinite`,
                        animationDelay: `${(index % 5) * -0.45}s`,
                        transformBox: "fill-box",
                        transformOrigin: "center",
                      }
                    : undefined
                }
              />
            );
          })}

          <path
            d="M390 42 L390 155"
            stroke="#A8BFA4"
            strokeWidth="2"
          />
          <rect
            x="385"
            y="145"
            width="10"
            height="17"
            rx="2"
            fill="#527D65"
            stroke="#A8BFA4"
          />

          <text
            x="403"
            y="39"
            fill="#A8BFA4"
            fontSize="11"
            fontWeight="600"
          >
            DO SENSOR
          </text>

          <path
            d="M200 210 L120 210 L120 245"
            stroke="#A8BFA4"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            fill="none"
          />
          <text x="130" y="255" fill="#9BAEB6" fontSize="10">
            AIR SUPPLY · VIRTUAL
          </text>
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-[#294858] bg-[#0B2230] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#9BAEB6]">
            <Activity size={14} />
            Oxygen target
          </div>
          <p className="text-xl font-semibold text-[#F2F0E8]">
            {displayedOxygen.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-[#9BAEB6]">
              mg/L
            </span>
          </p>
          <p className="mt-1 text-[10px] text-[#9BAEB6]">
            Illustrative virtual reading
          </p>
        </div>

        <div className="rounded-md border border-[#294858] bg-[#0B2230] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#9BAEB6]">
            <Wind size={14} />
            Virtual pump
          </div>
          <p className="text-xl font-semibold text-[#A8BFA4]">
            {running ? "Active" : "Paused"}
          </p>
          <p className="mt-1 text-[10px] text-[#9BAEB6]">
            Simulation only
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRunning((previous) => !previous)}
        className="mt-3 flex items-center justify-center gap-2 rounded-md border border-[#294858] px-4 py-3 text-xs text-[#C0D0D0] transition-colors hover:bg-[#527D65]/20"
      >
        {running ? <Pause size={14} /> : <Play size={14} />}
        {running ? "Pause virtual aeration" : "Resume virtual aeration"}
      </button>

      {relativeDemand != null && (
  <div className="mt-3 rounded-md border border-[#294858] bg-[#0B2230] p-4">
    <p className="text-xs text-[#9BAEB6]">
      Relative oxygen-transfer demand
    </p>

    <p className="mt-2 text-xl font-semibold text-[#A8BFA4]">
      {(relativeDemand * 100).toFixed(1)}%
    </p>

    <p className="mt-1 text-[10px] text-[#9BAEB6]">
      Simplified proxy relative to baseline
    </p>
  </div>
)}

      <p className="mt-3 text-[10px] leading-relaxed text-[#9BAEB6]">
        Conceptual animation only. Bubble motion does not represent
        measured airflow, verified oxygen transfer or predicted
        biological response.
      </p>
    </section>
  );
}