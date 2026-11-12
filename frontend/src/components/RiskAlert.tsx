
import { ArrowUpRight, Leaf, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function RiskAlert() {
  return (
    <section className="panel p-5">

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-[#A8BFA4]">
            <Leaf size={16} />
            <span className="text-[10px] font-semibold tracking-[0.12em]">
              AERATION SCENARIO REVIEW
            </span>
          </div>

          <div className="mb-3 flex items-center gap-2 text-[#E6B66A]">
            <ShieldCheck size={15} />
            <span className="text-xs">
              Historical research demonstration
            </span>
          </div>

          <h2 className="text-lg font-semibold text-[#F2F0E8]">
            Evaluate hypothetical operating targets
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#C0D0D0]">
            Explore hypothetical aeration strategies, compare operating
            constraints and identify scenarios that require further
            engineering review.
          </p>

          <p className="mt-3 text-xs text-[#9BAEB6]">
            N₂O reduction effects have not been validated.
            No physical equipment is controlled.
          </p>
        </div>

        <Link
          to="/intervention"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#A8BFA4] px-6 py-3 text-sm font-semibold text-[#091B2B] transition-colors hover:bg-[#D0E4C2]"
        >
          Explore Intervention Lab
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
