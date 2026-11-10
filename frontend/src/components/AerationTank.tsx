
import { useId, useState } from "react";
import { Waves, Power, Cpu, Radio, Zap } from "lucide-react";

interface AerationTankProps {
  initialActive?: boolean;
  targetDO?: number;
  relativeDemand?: number | null;
  mode?: "monitoring" | "intervention";
}

const bubbles = Array.from({ length: 36 }, (_, i) => ({
  x: 85 + (i * 23) % 235,
  y: 163 + (i % 3) * 5,
  r: 2 + (i % 4),
  delay: (i * 0.21) % 3,
  duration: 2 + (i % 4) * 0.4,
}));

export default function AerationTank({
  initialActive = true,
  targetDO = 2.0,
  relativeDemand = null,
  mode = "monitoring",
}: AerationTankProps) {
  const [active, setActive] = useState(initialActive);

  const id = useId();
  const waterId = `${id}-water`;
  const sideId = `${id}-side`;
  const glowId = `${id}-glow`;

  const isIntervention = mode === "intervention";

  // Animation intensity is illustrative.
  // After evaluation, use the backend demand proxy.
  const intensity = Math.max(
    0.25,
    Math.min(2, relativeDemand ?? targetDO / 2)
  );

  const bubbleCount = Math.min(
    bubbles.length,
    Math.round(18 * intensity)
  );

  const visibleBubbles = bubbles.slice(0, bubbleCount);

  return (
    <section className="panel p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-[#22e000] mb-2">
            DIGITAL TWIN / 01
          </p>

          <h2 className="text-lg font-semibold text-white">
            Aeration basin
          </h2>

          <p className="text-xs text-neutral-500 mt-1">
            {isIntervention
              ? "Proposed operating conditions"
              : "Virtual process visualization"}
          </p>
        </div>

        <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 border border-neutral-800 px-2.5 py-1.5 rounded-full">
          <Radio size={12} />
          {isIntervention ? "SCENARIO PREVIEW" : "SIMULATED"}
        </span>
      </div>

      <div className="relative flex-1 min-h-[240px] flex items-center justify-center rounded-xl overflow-hidden bg-[#0b0b0b] border border-neutral-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px),linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <svg
          viewBox="0 0 400 260"
          className="relative w-full max-w-[480px]"
          role="img"
          aria-label="Virtual wastewater aeration tank"
        >
          <defs>
            <linearGradient
              id={waterId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#22e000"
                stopOpacity=".22"
              />

              <stop
                offset="100%"
                stopColor="#22e000"
                stopOpacity=".025"
              />
            </linearGradient>

            <linearGradient
              id={sideId}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#222" />
              <stop offset="100%" stopColor="#111" />
            </linearGradient>

            <filter id={glowId}>
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>

          {/* Tank walls */}
          <path
            d="M35 72 L85 40 H315 L365 72 V193 L315 225 H85 L35 193 Z"
            fill={`url(#${sideId})`}
            stroke="#555"
            strokeWidth="1.2"
          />

          {/* Water surface */}
          <path
            d="M35 90 L85 58 H315 L365 90 L315 122 H85 Z"
            fill="#142910"
            stroke="#22e000"
            strokeOpacity=".5"
          />

          {/* Front water volume */}
          <path
            d="M35 90 L85 122 H315 L365 90 V193 L315 225 H85 L35 193 Z"
            fill={`url(#${waterId})`}
            stroke="#365b2e"
          />

          {/* Tank edges */}
          <path
            d="M85 122 V225 M315 122 V225"
            stroke="#555"
            strokeWidth="1"
          />

          {/* Air diffuser */}
          <path
            d="M95 190 H305"
            stroke={active ? "#22e000" : "#444"}
            strokeWidth={active ? 3 + intensity : 4}
            strokeLinecap="round"
          />

          {Array.from({ length: 9 }, (_, i) => (
            <circle
              key={i}
              cx={100 + i * 25}
              cy={190}
              r="2.5"
              fill={active ? "#b2ff9d" : "#666"}
            />
          ))}

          {/* Dynamic aeration bubbles */}
          {active &&
            visibleBubbles.map((b, i) => (
              <g
                key={i}
                style={{
                  animation: `bubble-rise ${
                    b.duration / intensity
                  }s ${b.delay}s infinite`,
                }}
              >
                <circle
                  cx={b.x}
                  cy={b.y}
                  r={b.r + 2}
                  fill="#22e000"
                  opacity=".18"
                  filter={`url(#${glowId})`}
                />

                <circle
                  cx={b.x}
                  cy={b.y}
                  r={b.r}
                  fill="#22e000"
                  fillOpacity=".12"
                  stroke="#72ff59"
                  strokeWidth=".9"
                />
              </g>
            ))}

          {/* Dissolved oxygen sensor */}
          <path
            d="M270 36 V115"
            stroke="#aaa"
            strokeWidth="2"
          />

          <rect
            x="265"
            y="108"
            width="10"
            height="20"
            rx="3"
            fill="#333"
            stroke="#22e000"
          />

          <circle
            cx="270"
            cy="123"
            r="2"
            fill="#22e000"
          />

          <path
            d="M270 36 H350"
            stroke="#22e000"
            strokeDasharray="3 4"
          />

          <text
            x="350"
            y="28"
            textAnchor="end"
            fill="#22e000"
            fontSize="9"
          >
            {isIntervention
              ? `DO TARGET: ${targetDO.toFixed(1)}`
              : "DO SENSOR"}
          </text>

          {/* Air supply line */}
          <path
            d="M95 190 H15 V238 H130"
            fill="none"
            stroke={active ? "#22e000" : "#555"}
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />

          <text
            x="135"
            y="242"
            fill="#888"
            fontSize="9"
          >
            AIR SUPPLY
          </text>

          <text
            x="200"
            y="253"
            fill="#555"
            fontSize="8"
            textAnchor="middle"
          >
            BASIN A-01 · VIRTUAL MODEL
          </text>
        </svg>
      </div>

      {/* Tank metrics */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-neutral-500 text-xs">
            <Waves size={14} />

            {isIntervention
              ? "Proposed oxygen"
              : "Oxygen"}
          </div>

          <p className="text-xl font-semibold text-white mt-2">
            {targetDO.toFixed(1)}
            <span className="text-xs text-neutral-500 ml-1">
              mg/L
            </span>
          </p>

          <p className="text-[10px] text-neutral-600 mt-1">
            {isIntervention
              ? "Operator-selected target"
              : "Example reading"}
          </p>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-neutral-500 text-xs">
            {isIntervention ? (
              <Zap size={14} />
            ) : (
              <Cpu size={14} />
            )}

            {isIntervention
              ? "Transfer capacity"
              : "Virtual pump"}
          </div>

          <p
            className={`text-xl font-semibold mt-2 ${
              active
                ? "text-[#22e000]"
                : "text-neutral-400"
            }`}
          >
            {isIntervention
              ? relativeDemand !== null
                ? `${(relativeDemand * 100).toFixed(1)}%`
                : "Preview"
              : active
                ? "Active"
                : "Inactive"}
          </p>

          <p className="text-[10px] text-neutral-600 mt-1">
            {isIntervention
              ? relativeDemand !== null
                ? "Relative to baseline"
                : "Run scenario to calculate"
              : "Simulation only"}
          </p>
        </div>
      </div>

      {/* Virtual pump control */}
      <button
        type="button"
        onClick={() => setActive(!active)}
        aria-pressed={active}
        className={`mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold transition-colors ${
          active
            ? "border border-neutral-700 text-neutral-300 hover:bg-white/5"
            : "bg-[#22e000] text-black hover:bg-[#35f011]"
        }`}
      >
        <Power size={15} />

        {active
          ? "Pause virtual aeration"
          : "Start virtual aeration"}
      </button>

      {isIntervention && (
        <p className="text-[10px] text-neutral-500 mt-3">
          Illustrative animation. Bubble intensity is a
          visualization of the proposed setting or
          calculated transfer-capacity proxy, not actual
          pump output or a predicted biological response.
        </p>
      )}
    </section>
  );
}