
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Monitoring from "./pages/Monitoring";
import InterventionLab from "./pages/InterventionLab";
import Impact from "./pages/Impact";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#080808] text-neutral-200">
        <Sidebar />

        <main className="ml-60 min-h-screen px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/intervention" element={<InterventionLab />} />
            <Route path="/impact" element={<Impact />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}