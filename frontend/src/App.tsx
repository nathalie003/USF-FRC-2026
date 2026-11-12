
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import SiteFooter from "./components/SiteFooter";
import "./corporate.css";
import Overview from "./pages/Overview";
import Monitoring from "./pages/Monitoring";
import InterventionLab from "./pages/InterventionLab";
import Impact from "./pages/Impact";

export default function App() {
  return (
    <BrowserRouter>
      <div className="corporate-site">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Sidebar />

        <main id="main-content" className="corporate-main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/intervention" element={<InterventionLab />} />
            <Route path="/impact" element={<Impact />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}