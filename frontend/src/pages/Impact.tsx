
import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Droplets,
  Globe2,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Wind,
} from "lucide-react";

const sections = [
  {
    icon: Globe2,
    title: "Climate significance",
    eyebrow: "WHY N₂O MATTERS",
    description:
      "Nitrous oxide is a powerful, long-lived greenhouse gas. Wastewater treatment is one of several human activities that can release N₂O into the atmosphere.",
    detail:
      "Guardian focuses on helping treatment operators recognize changing process conditions before emissions events develop.",
  },
  {
    icon: Droplets,
    title: "Wastewater operations",
    eyebrow: "THE ENGINEERING CHALLENGE",
    description:
      "Biological nitrogen removal can produce N₂O under certain operating conditions. Dissolved oxygen, nitrogen compounds and treatment processes all influence emissions.",
    detail:
      "Monitoring and forecasting can help operators identify periods that deserve closer investigation.",
  },
  {
    icon: HeartHandshake,
    title: "Environmental justice",
    eyebrow: "WHO BENEFITS",
    description:
      "Communities facing disproportionate environmental burdens deserve access to cleaner, more accountable infrastructure.",
    detail:
      "Guardian's long-term goal is to make advanced environmental decision-support tools more accessible to wastewater utilities with limited resources.",
  },
];

const capabilities = [
  {
    name: "Historical wastewater monitoring",
    status: "Implemented",
    detail: "Recorded process observations from Arion's dataset",
    complete: true,
  },
  {
    name: "30-minute N₂O forecasting",
    status: "Integration pending",
    detail: "Awaiting Nathalie's forecasting model",
    complete: false,
  },
  {
    name: "Aeration scenario screening",
    status: "Implemented",
    detail: "Simplified oxygen-transfer demand proxy and demo constraints",
    complete: true,
  },
  {
    name: "Validated N₂O reduction estimates",
    status: "Not established",
    detail: "Requires a validated process-response model and evaluation",
    complete: false,
  },
];

export default function Impact() {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#22e000] uppercase mb-2">
            Guardian / Impact
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Intelligence for a cleaner future.
          </h1>

          <p className="text-[#969696] mt-3 max-w-2xl">
            Understanding the climate challenge, the communities
            affected by environmental burdens and the role of
            responsible wastewater intelligence.
          </p>
        </div>

        <span className="rounded-full border border-[#333] px-4 py-2 text-xs text-[#969696]">
          RESEARCH PROTOTYPE
        </span>
      </header>

      <section className="panel p-7 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#22e000]/10 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 text-[#22e000] mb-4">
            <Leaf size={18} />
            <span className="text-xs tracking-widest">
              OUR MISSION
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-3xl leading-tight">
            Make invisible wastewater emissions
            <span className="text-[#22e000]"> visible.</span>
          </h2>

          <p className="text-[#aaa] mt-5 max-w-2xl leading-relaxed">
            N₂O Guardian combines historical process data,
            predictive modeling and scenario screening to
            support better-informed wastewater operations.
            Its goal is to help identify potential emissions
            risks before they become larger problems.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <span className="rounded-full bg-[#22e000]/10 border border-[#22e000]/20 px-4 py-2 text-xs text-[#22e000]">
              Data-driven awareness
            </span>

            <span className="rounded-full bg-[#22e000]/10 border border-[#22e000]/20 px-4 py-2 text-xs text-[#22e000]">
              Decision support
            </span>

            <span className="rounded-full bg-[#22e000]/10 border border-[#22e000]/20 px-4 py-2 text-xs text-[#22e000]">
              Responsible innovation
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <section key={section.title} className="panel p-6">
              <div className="w-11 h-11 rounded-xl bg-[#22e000]/10 flex items-center justify-center mb-6">
                <Icon size={22} className="text-[#22e000]" />
              </div>

              <p className="text-[10px] tracking-widest text-[#22e000] mb-2">
                {section.eyebrow}
              </p>

              <h3 className="text-xl font-semibold mb-4">
                {section.title}
              </h3>

              <p className="text-sm text-[#aaa] leading-relaxed">
                {section.description}
              </p>

              <div className="border-t border-[#292929] mt-6 pt-5">
                <p className="text-sm text-[#888] leading-relaxed">
                  {section.detail}
                </p>
              </div>
            </section>
          );
        })}
      </div>

      <section className="panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <Wind size={21} className="text-[#22e000]" />

          <div>
            <p className="text-[10px] tracking-widest text-[#22e000] mb-1">
              OPERATIONAL IMPACT
            </p>

            <h2 className="text-xl font-semibold">
              From awareness to action
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "Observe",
              detail:
                "Examine recorded dissolved oxygen, nitrogen measurements and N₂O emissions.",
            },
            {
              step: "02",
              title: "Anticipate",
              detail:
                "Use a 30-minute forecasting model, once integrated, to estimate future emissions.",
            },
            {
              step: "03",
              title: "Evaluate",
              detail:
                "Compare candidate operating scenarios while acknowledging model limitations.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-[#292929] bg-[#0b0b0b] p-5"
            >
              <p className="text-[#22e000] text-xs font-semibold mb-5">
                {item.step}
              </p>

              <h3 className="text-lg font-semibold mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-[#969696] leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] tracking-widest text-[#22e000] mb-2">
              EVIDENCE & TRANSPARENCY
            </p>

            <h2 className="text-xl font-semibold">
              What Guardian can demonstrate
            </h2>
          </div>

          <ShieldCheck size={22} className="text-[#22e000]" />
        </div>

        <div className="space-y-3">
          {capabilities.map((item) => (
            <div
              key={item.name}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-[#292929] pb-4"
            >
              <div className="flex gap-3">
                {item.complete ? (
                  <CheckCircle2
                    size={18}
                    className="text-[#22e000] shrink-0 mt-0.5"
                  />
                ) : (
                  <CircleAlert
                    size={18}
                    className="text-[#ffb454] shrink-0 mt-0.5"
                  />
                )}

                <div>
                  <p className="text-sm font-medium">
                    {item.name}
                  </p>

                  <p className="text-xs text-[#888] mt-1">
                    {item.detail}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs ${
                  item.complete
                    ? "text-[#22e000]"
                    : "text-[#ffb454]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowMethodology((value) => !value)}
          className="flex items-center gap-2 text-sm text-[#22e000] mt-6 hover:underline"
        >
          {showMethodology
            ? "Hide methodology notes"
            : "View methodology notes"}
          <ArrowUpRight size={15} />
        </button>

        {showMethodology && (
          <div className="mt-5 rounded-xl bg-[#0b0b0b] border border-[#292929] p-5 space-y-3 text-sm text-[#aaa] leading-relaxed">
            <p>
              <strong className="text-white">Monitoring:</strong>{" "}
              Historical observations are drawn from a
              wastewater dataset covering 2018–2019.
              Measurement units and calibration require
              source verification.
            </p>

            <p>
              <strong className="text-white">Forecasting:</strong>{" "}
              A 30-minute-ahead prediction target has been
              prepared. Forecast accuracy must be reported
              using held-out evaluation data.
            </p>

            <p>
              <strong className="text-white">Simulation:</strong>{" "}
              The current backend estimates relative
              oxygen-transfer demand and screens demo
              operating constraints. It does not calculate
              validated N₂O emissions reductions.
            </p>

            <p>
              <strong className="text-white">Environmental justice:</strong>{" "}
              Community benefits are a project objective,
              not an outcome measured by the current dataset.
            </p>
          </div>
        )}
      </section>

      <p className="text-xs text-[#777]">
        Guardian research prototype · No verified emissions
        reductions or plant deployment claims
      </p>
    </div>
  );
}
