import { useState } from "react";
import { Droplets, Menu, X, ArrowUpRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { name: "Overview", path: "/" },
  { name: "Monitoring", path: "/monitoring" },
  { name: "Intervention Lab", path: "/intervention" },
  { name: "Impact", path: "/impact" },
];

// Kept under its existing name so the application shell needs no routing changes.
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="site-utility"><span>Environmental engineering &amp; machine learning</span><span>NSBE AI Impact-A-Thon · Research prototype</span></div>
      <div className="site-nav-row">
        <Link to="/" className="site-brand" aria-label="N₂O Guardian home" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Droplets size={28} strokeWidth={1.6} /></span>
          <span>N₂O Guardian<small>WASTEWATER INTELLIGENCE</small></span>
        </Link>
        <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(value => !value)}>{open ? <X size={24} /> : <Menu size={24} />}</button>
        <nav id="site-navigation" aria-label="Main navigation" className={`site-navigation${open ? " is-open" : ""}`}>
          {links.map(link => <NavLink key={link.path} to={link.path} end={link.path === "/"} onClick={() => setOpen(false)}>{link.name}</NavLink>)}
          <Link to="/intervention" className="nav-tool-link" onClick={() => setOpen(false)}>Explore the lab <ArrowUpRight size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}
