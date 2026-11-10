
import { useState } from "react";
import { Waves, Power, Cpu, Radio } from "lucide-react";

interface AerationTankProps {
  initialActive?: boolean;
}

const bubbles = Array.from({ length: 18 }, (_, i) => ({
  x: 85 + (i * 23) % 235,
  y: 163 + (i % 3) * 5,
  r: 2 + (i % 4),
  delay: (i * 0.21) % 3,
  duration: 2 + (i % 4) * 0.4,
}));

export default function AerationTank({
  initialActive = true,
}: AerationTankProps) {
  const [active, setActive] = useState(initialActive);

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
            Virtual process visualization
          </p>
        </div>

        <span className="flex items-center gap-1.5 text-[10px] text-neutral-400 border border-neutral-800 px-2.5 py-1.5 rounded-full">
          <Radio size={12} />
          SIMULATED
        </span>
      </div>

      <div className="relative flex-1 min-h-[240px] flex items-center justify-center rounded-xl overflow-hidden bg-[#0b0b0b] border border-neutral-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
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
            <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22e000" stopOpacity=".22" />
              <stop offset="100%" stopColor="#22e000" stopOpacity=".025" />
            </linearGradient>

            <linearGradient id="tankSide" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#222" />
              <stop offset="100%" stopColor="#111" />
            </linearGradient>

            <filter id="bubbleGlow">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>

          {/* Tank walls */}
          <path
            d="M35 72 L85 40 H315 L365 72 V193 L315 225 H85 L35 193 Z"
            fill="url(#tankSide)"
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
            fill="url(#waterFill)"
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
            strokeWidth="4"
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

          {/* Animated aeration bubbles */}
          {active &&
            bubbles.map((b, i) => (
              <g
                key={i}
                style={{
                  animation: `bubble-rise ${b.duration}s ${b.delay}s infinite`,
                }}
              >
                <circle
                  cx={b.x}
                  cy={b.y}
                  r={b.r + 2}
                  fill="#22e000"
                  opacity=".18"
                  filter="url(#bubbleGlow)"
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

          <circle cx="270" cy="123" r="2" fill="#22e000" />

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
            DO SENSOR
          </text>

          {/* Air supply line */}
          <path
            d="M95 190 H15 V238 H130"
            fill="none"
            stroke={active ? "#22e000" : "#555"}
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />

          <text x="135" y="242" fill="#888" fontSize="9">
            AIR SUPPLY
          </text>

          <text x="200" y="253" fill="#555" fontSize="8" textAnchor="middle">
            BASIN A-01 · VIRTUAL MODEL
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-neutral-500 text-xs">
            <Waves size={14} />
            Oxygen
          </div>
          <p className="text-xl font-semibold text-white mt-2">
            2.0 <span className="text-xs text-neutral-500">mg/L</span>
          </p>
          <p className="text-[10px] text-neutral-600 mt-1">
            Example reading
          </p>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-neutral-500 text-xs">
            <Cpu size={14} />
            Virtual pump
          </div>
          <p className={`text-xl font-semibold mt-2 ${
            active ? "text-[#22e000]" : "text-neutral-400"
          }`}>
            {active ? "Active" : "Inactive"}
          </p>
          <p className="text-[10px] text-neutral-600 mt-1">
            Simulation only
          </p>
        </div>
      </div>

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
        {active ? "Pause virtual aeration" : "Start virtual aeration"}
      </button>
    </section>
  );
}