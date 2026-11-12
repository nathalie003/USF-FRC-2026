import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div><Link className="footer-brand" to="/">N₂O Guardian</Link><p>Wastewater process data.<br />Engineering insight. Environmental responsibility.</p><span className="footer-project">NSBE AI Impact-A-Thon · 2026</span></div>
        <div><h2>Explore the project</h2><Link to="/monitoring">Historical monitoring</Link><Link to="/intervention">Intervention Lab</Link><Link to="/impact">Impact &amp; methodology</Link></div>
        <div><h2>Research status</h2><p>Student research prototype using historical observations. Measurement units remain unverified. Simulations do not establish emission reductions or operational safety.</p></div>
      </div>
      <div className="footer-base"><span>© 2026 N₂O Guardian · Research demonstration</span><details><summary>Photography &amp; attribution</summary><p><a href="https://commons.wikimedia.org/wiki/File:Blue_Plains_WWTP_-_aerial_2009.jpg">Blue Plains WWTP</a> — dbking (2009). <a href="https://commons.wikimedia.org/wiki/File:Belebungsbecken_-_aeration_tank_(12359229313).jpg">Dresden aeration tank</a> — SuSanA Secretariat (2011). Both <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>. Resized and cropped for display. Photographs show reference facilities unrelated to our dataset; no affiliation or endorsement is implied.</p></details></div>
    </footer>
  );
}
