
import {
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RiskAlert() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#294522] bg-[#10160e] p-7">
      <div className="absolute right-0 top-0 w-72 h-72 bg-[#22e000]/5 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={17} className="text-[#22e000]" />
            <p className="text-[10px] tracking-[0.2em] font-semibold text-[#22e000]">
              GUARDIAN AI
            </p>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} className="text-[#ffb454]" />
            <span className="text-xs text-[#ffb454]">
              Example elevated-risk alert
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-white">
            Stay ahead of emissions.
          </h2>

          <p className="text-sm text-neutral-400 max-w-xl mt-2 leading-relaxed">
            Explore alternative aeration strategies, compare modeled
            outcomes and evaluate operational constraints before
            implementing a change.
          </p>
        </div>

        <Link
          to="/intervention"
          className="shrink-0 inline-flex justify-center items-center gap-3 bg-[#22e000] hover:bg-[#39f019] text-black font-semibold px-6 py-3.5 rounded-lg text-sm transition-colors"
        >
          Launch Intervention Lab
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}