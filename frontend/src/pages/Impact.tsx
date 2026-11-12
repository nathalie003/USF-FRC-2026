
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
      "Guardian evaluates historical process conditions and forecasts emission risk for further engineering review.",
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
  status: "Implemented",
  detail:
    "Integrated XGBoost model using historical wastewater observations",
  complete: true,
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
    <div className="workspace-page impact-page space-y-6 pb-10">
      <header className="page-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.12em] text-[#A8BFA4] uppercase mb-2">
            PROJECT CONTEXT / 04
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Environmental context & project scope
          </h1>

          <p className="text-[#9BAEB6] mt-3 max-w-2xl">
            Understanding the climate challenge, the communities
            affected by environmental burdens and the role of
            wastewater forecasting research.
          </p>
        </div>

        <span className="rounded-full border border-[#527D65] px-4 py-2 text-xs text-[#9BAEB6]">
          RESEARCH PROTOTYPE
        </span>
      </header>

      <section className="impact-feature">
        <figure><img src="/images/dresden-aeration-basin.jpg" alt="Aeration basin and walkways at Dresden Kaditz wastewater treatment plant" width="800" height="600" loading="lazy" /><figcaption>Dresden Kaditz · Reference facility, not our research site</figcaption></figure>

        <div className="impact-feature-copy">
          <div className="flex items-center gap-2 text-[#A8BFA4] mb-4">
            <Leaf size={18} />
            <span className="text-xs tracking-widest">
              PROJECT OBJECTIVE
            </span>
          </div>

          <h2 className="text-3xl md:text-2xl font-semibold tracking-tight max-w-3xl leading-tight">
            Assess emission risk from historical process data
          </h2>

          <p className="text-[#C0D0D0] mt-5 max-w-2xl leading-relaxed">
            N₂O Guardian combines historical process data,
            predictive modeling and scenario screening to
            support better-informed wastewater operations.
            Its goal is to help identify potential emissions
            risks before they become larger problems.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <span className="rounded-full bg-[#A8BFA4]/10 border border-[#A8BFA4]/20 px-4 py-2 text-xs text-[#A8BFA4]">
              Historical observations
            </span>

            <span className="rounded-full bg-[#A8BFA4]/10 border border-[#A8BFA4]/20 px-4 py-2 text-xs text-[#A8BFA4]">
              Decision support
            </span>

            <span className="rounded-full bg-[#A8BFA4]/10 border border-[#A8BFA4]/20 px-4 py-2 text-xs text-[#A8BFA4]">
              Scenario screening
            </span>
          </div>
        </div>
      </section>

      <div className="impact-context-grid grid grid-cols-1 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <section key={section.title} className="panel p-6">
              <div className="w-11 h-11 rounded-md bg-[#A8BFA4]/10 flex items-center justify-center mb-6">
                <Icon size={22} className="text-[#A8BFA4]" />
              </div>

              <p className="text-[10px] tracking-widest text-[#A8BFA4] mb-2">
                {section.eyebrow}
              </p>

              <h3 className="text-xl font-semibold mb-4">
                {section.title}
              </h3>

              <p className="text-sm text-[#C0D0D0] leading-relaxed">
                {section.description}
              </p>

              <div className="border-t border-[#294858] mt-6 pt-5">
                <p className="text-sm text-[#9BAEB6] leading-relaxed">
                  {section.detail}
                </p>
              </div>
            </section>
          );
        })}
      </div>

      <section className="panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <Wind size={21} className="text-[#A8BFA4]" />

          <div>
            <p className="text-[10px] tracking-widest text-[#A8BFA4] mb-1">
              OPERATIONAL IMPACT
            </p>

            <h2 className="text-xl font-semibold">
              Monitoring, forecasting and scenario review
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
                "Use the integrated XGBoost model to predict N₂O emissions 30 minutes ahead.",
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
              className="rounded-md border border-[#294858] bg-[#0B2230] p-5"
            >
              <p className="text-[#A8BFA4] text-xs font-semibold mb-5">
                {item.step}
              </p>

              <h3 className="text-lg font-semibold mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-[#9BAEB6] leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] tracking-widest text-[#A8BFA4] mb-2">
              EVIDENCE & TRANSPARENCY
            </p>

            <h2 className="text-xl font-semibold">
              Implemented capabilities & evidence limits
            </h2>
          </div>

          <ShieldCheck size={22} className="text-[#A8BFA4]" />
        </div>

        <div className="space-y-3">
          {capabilities.map((item) => (
            <div
              key={item.name}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-[#294858] pb-4"
            >
              <div className="flex gap-3">
                {item.complete ? (
                  <CheckCircle2
                    size={18}
                    className="text-[#A8BFA4] shrink-0 mt-0.5"
                  />
                ) : (
                  <CircleAlert
                    size={18}
                    className="text-[#E6B66A] shrink-0 mt-0.5"
                  />
                )}

                <div>
                  <p className="text-sm font-medium">
                    {item.name}
                  </p>

                  <p className="text-xs text-[#9BAEB6] mt-1">
                    {item.detail}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs ${
                  item.complete
                    ? "text-[#A8BFA4]"
                    : "text-[#E6B66A]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={showMethodology}
          aria-controls="methodology-notes"
          onClick={() => setShowMethodology((value) => !value)}
          className="flex items-center gap-2 text-sm text-[#A8BFA4] mt-6 hover:underline"
        >
          {showMethodology
            ? "Hide methodology notes"
            : "View methodology notes"}
          <ArrowUpRight size={15} />
        </button>

        {showMethodology && (
          <div id="methodology-notes" className="mt-5 rounded-md bg-[#0B2230] border border-[#294858] p-5 space-y-3 text-sm text-[#C0D0D0] leading-relaxed">
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
            <strong className="text-white">Forecasting:</strong>{" "}
            Guardian uses an integrated XGBoost model to predict N₂O
            emissions 30 minutes ahead using historical wastewater
            measurements. Model predictions support risk awareness,
            not verified operational interventions.
          </p>

            <p>
              <strong className="text-white">Environmental justice:</strong>{" "}
              Community benefits are a project objective,
              not an outcome measured by the current dataset.
            </p>
          </div>
        )}
      </section>

      <p className="text-xs text-[#9BAEB6]">
        Guardian research prototype · No verified emissions
        reductions or plant deployment claims
      </p>
    </div>
  );
}
