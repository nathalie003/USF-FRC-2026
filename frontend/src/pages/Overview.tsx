
import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Waves,
  BrainCircuit,
} from "lucide-react";

import MetricCard from "../components/MetricCard";
import ForecastChart from "../components/ForecastChart";
import AerationTank from "../components/AerationTank";
import { Link } from "react-router-dom";
import "./Overview.css";

import {
  fetchLatestForecast,
  fetchMonitoringHistory,
} from "../services/api";

import type {
  ForecastResponse,
  MonitoringObservation,
} from "../services/api";

import type { ForecastPoint } from "../types";

function formatHistoricalTime(value: string): string {
  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function riskLabel(level: ForecastResponse["risk_level"]): string {
  switch (level) {
    case "high_risk":
      return "High risk";
    case "watch":
      return "Watch";
    default:
      return "Normal";
  }
}

function riskColor(level: ForecastResponse["risk_level"]): string {
  switch (level) {
    case "high_risk":
      return "text-red-400";
    case "watch":
      return "text-amber-400";
    default:
      return "text-[#A8BFA4]";
  }
}

export default function Overview() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [latestObservation, setLatestObservation] =
    useState<MonitoringObservation | null>(null);
  const [recentObservations, setRecentObservations] =
    useState<MonitoringObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        const [forecastResult, historyResult] = await Promise.all([
          fetchLatestForecast(),
          fetchMonitoringHistory(74160, 12),
        ]);

        if (!active) return;

        setForecast(forecastResult);
        setRecentObservations(historyResult.observations);
        setLatestObservation(historyResult.observations.at(-1) ?? null);
        
        setError(null);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load historical data."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo<ForecastPoint[]>(() => {
  const observedPoints: ForecastPoint[] = recentObservations.map(
    (observation) => ({
      time: observation.time.slice(11, 16),
      observed: observation.n2o_emission_rate ?? undefined,
    })
  );

  if (forecast) {
    observedPoints.push({
      time: forecast.forecast_time.slice(11, 16),
      forecast: forecast.forecast,
    });
  }

  return observedPoints;
}, [recentObservations, forecast]);

  const lastObservedTime =
  recentObservations.at(-1)?.time.slice(11, 16);

  const currentEmission = latestObservation?.n2o_emission_rate;
  const currentDO = latestObservation?.dissolved_oxygen;

  return (
    <div className="engineering-overview" aria-busy={loading}>
      <header className="corporate-hero">
        <div className="hero-copy">
          <p className="corporate-eyebrow">ENGINEERED FOR A MORE SUSTAINABLE WATER CYCLE</p>
          <h1>Smarter Wastewater Operations. <span>Lower Environmental Impact.</span></h1>
          <p className="hero-description">N₂O Guardian uses machine learning to forecast nitrous oxide emissions and help engineers examine wastewater treatment decisions.</p>
          <div className="hero-actions"><Link to="/monitoring" className="corporate-button">Explore Monitoring <span aria-hidden="true">→</span></Link><a href="#technology" className="corporate-button secondary">View Our Technology</a></div>
          <p className="hero-disclosure">A student research prototype. Lower impact is our objective; emission reductions have not been verified.</p>
        </div>
        <figure className="hero-image"><img src="/images/blue-plains-wwtp.jpg" alt="An aerial view of treatment basins and infrastructure at Blue Plains wastewater treatment plant" width="1200" height="824" fetchPriority="high" /><figcaption>Blue Plains WWTP, Washington, D.C. · Reference photography, not our research facility</figcaption></figure>
      </header>
      <div className="project-band"><span>NSBE AI IMPACT-A-THON 2026</span><p>Environmental engineering <span aria-hidden="true">/</span> Historical data <span aria-hidden="true">/</span> Explainable forecasting</p></div>
      <section className="home-context">
        <div><p className="corporate-eyebrow">THE CHALLENGE</p><h2>A closer look at what wastewater treatment releases.</h2></div>
        <div><p>Wastewater treatment protects water quality. Biological nitrogen removal can also release nitrous oxide, a greenhouse gas whose emissions depend on changing process conditions.</p><p>Understanding those patterns is an engineering challenge. Our project brings recorded measurements, short-horizon forecasts and hypothetical aeration scenarios into one place for investigation.</p><Link className="text-link" to="/impact">Understand the environmental context <span aria-hidden="true">→</span></Link></div>
      </section>
      <section className="home-method" aria-labelledby="method-heading">
        <div className="home-section-title"><div><p className="corporate-eyebrow">OUR APPROACH</p><h2 id="method-heading">From process data to informed review.</h2></div><p>Three connected tools, with a clear distinction between observation, prediction and simulation.</p></div>
        <div className="method-grid">
          <article><span className="method-number">01 / OBSERVE</span><h3>Understand the baseline</h3><p>Explore historical dissolved oxygen, nitrogen measurements and N₂O emission records across the dataset.</p><Link to="/monitoring" className="text-link">Explore the records <span aria-hidden="true">→</span></Link></article>
          <article><span className="method-number">02 / FORECAST</span><h3>Examine emission risk</h3><p>Review the XGBoost 30-minute forecast, risk classification and SHAP feature contributions.</p><a href="#technology" className="text-link">View the technology <span aria-hidden="true">→</span></a></article>
          <article><span className="method-number">03 / EVALUATE</span><h3>Screen operating scenarios</h3><p>Compare hypothetical aeration settings against demonstration constraints and an oxygen-demand proxy.</p><Link to="/intervention" className="text-link">Visit the Intervention Lab <span aria-hidden="true">→</span></Link></article>
        </div>
      </section>
      <section id="technology" className="home-technology" aria-labelledby="technology-heading">
        <div className="technology-intro"><div><p className="section-code">THE TECHNOLOGY / RESEARCH DEMONSTRATION</p><h2 id="technology-heading">Engineering insight, open to inspection.</h2><p>Explore the underlying observations, forecast output and model explanations.</p></div><span className="technology-status">HISTORICAL REPLAY · NOT LIVE</span></div>
        <dl className="technology-meta"><div><dt>Data acquisition</dt><dd>Historical dataset · units unverified</dd></div><div><dt>Latest observation</dt><dd>{latestObservation ? formatHistoricalTime(latestObservation.time) : loading ? "Loading…" : "Unavailable"}</dd></div></dl>
      {error && <div role="alert" className="data-notice">Unable to load dashboard data: {error}</div>}
      <section aria-label="Historical data instrument strip" className="instrument-strip">
        <MetricCard title="N₂O emission rate" value={loading ? "Loading…" : currentEmission != null ? currentEmission.toFixed(4) : "Unavailable"} subtitle="Historical measurement · units unverified" icon={Activity} color="text-white" />
        <MetricCard title="30-minute forecast" value={loading ? "Loading…" : forecast ? forecast.forecast.toFixed(4) : "Unavailable"} subtitle="XGBoost · units unverified" icon={BrainCircuit} color="text-[#A8BFA4]" />
        <MetricCard title="Forecast risk" value={loading ? "Loading…" : forecast ? riskLabel(forecast.risk_level) : "Unavailable"} subtitle="Demonstration model classification" icon={AlertTriangle} color={forecast ? riskColor(forecast.risk_level) : "text-white"} />
        <MetricCard title="Dissolved oxygen" value={loading ? "Loading…" : currentDO != null ? currentDO.toFixed(2) : "Unavailable"} subtitle="Historical reading · units unverified" icon={Waves} color="text-white" />
      </section>
      <div className="overview-columns">
        <div className="analysis-column">
          <ForecastChart data={chartData} forecastValue={forecast?.forecast} forecastTime={forecast?.forecast_time.slice(11, 16)} lastObservedTime={lastObservedTime} />
          <section className="technical-panel" aria-labelledby="forecast-details">
            <div className="section-heading"><div><p className="section-code">MODEL OUTPUT / XGBOOST</p><h2 id="forecast-details">30-minute forecast record</h2></div><span>Historical inference</span></div>
            {forecast ? <>
              <dl className="forecast-record">
                <div><dt>Predicted emission rate</dt><dd>{forecast.forecast.toFixed(4)} <small>units unverified</small></dd></div>
                <div><dt>Risk classification</dt><dd className={riskColor(forecast.risk_level)}>{riskLabel(forecast.risk_level)}</dd></div>
                <div><dt>Classification thresholds</dt><dd>Watch ≥ {forecast.watch_cutoff.toFixed(4)} · High ≥ {forecast.high_risk_cutoff.toFixed(4)}</dd></div>
                <div><dt>Forecast timestamp</dt><dd>{formatHistoricalTime(forecast.forecast_time)}</dd></div>
                <div><dt>Input window</dt><dd>{formatHistoricalTime(forecast.window_start)} – {formatHistoricalTime(forecast.window_end)}</dd></div>
              </dl>
              <h3 className="table-heading">SHAP feature contributions</h3>
              <div className="table-scroll"><table><caption className="sr-only">Top model feature contributions on the transformed prediction scale</caption><thead><tr><th scope="col">Input variable</th><th scope="col">Direction</th><th scope="col" className="numeric">Contribution</th></tr></thead><tbody>
                {forecast.top_reasons.map(reason => <tr key={reason.sensor}><th scope="row">{reason.sensor}</th><td className={reason.direction === "raises" ? "contribution-raises" : "contribution-lowers"}>{reason.direction === "raises" ? "↑ Raises forecast" : "↓ Lowers forecast"}</td><td className="numeric">{reason.contribution > 0 ? "+" : ""}{reason.contribution.toFixed(4)}</td></tr>)}
              </tbody></table></div>
              <p className="technical-note">SHAP values use the model’s transformed prediction scale. Contributions are not causal effects or intervention outcomes.</p>
            </> : <p className="technical-note" role="status">{loading ? "Loading historical forecast…" : "Forecast data is unavailable."}</p>}
          </section>
        </div>
        <div className="equipment-column">
          <section className="technical-panel basin-reference">
            <div className="section-heading"><div><p className="section-code">PROCESS REFERENCE</p><h2>Biological treatment / aeration</h2></div></div>
            <figure><img src="/images/dresden-aeration-basin.jpg" alt="Aeration basin at Dresden Kaditz wastewater treatment plant" width="800" height="600" loading="lazy" /><figcaption>Dresden Kaditz · reference basin, not monitored equipment</figcaption></figure>
          </section>
          <AerationTank title="Aeration basin schematic" subtitle="Demonstration only · virtual equipment and readings" />
          <section className="scenario-link"><p className="section-code">ENGINEERING REVIEW</p><h2>Operating scenarios</h2><p>Compare hypothetical aeration settings. N₂O reduction effects are unvalidated; no physical equipment is controlled.</p><Link to="/intervention">Open intervention lab <span aria-hidden="true">→</span></Link></section>
        </div>
      </div>
      </section>
      <section className="home-closing"><div><p className="corporate-eyebrow">BUILT FOR INVESTIGATION</p><h2>A practical starting point for engineering questions.</h2><p>See what the prototype implements, what the data can support and where further validation is needed.</p></div><Link to="/impact" className="corporate-button">Project scope &amp; evidence <span aria-hidden="true">→</span></Link></section>
    </div>
  );
}
