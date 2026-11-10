
import {
  Droplets,
  LayoutDashboard,
  Activity,
  FlaskConical,
  Leaf,
  Settings2,
  ArrowUpRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Monitoring", path: "/monitoring", icon: Activity },
  { name: "Intervention Lab", path: "/intervention", icon: FlaskConical },
  { name: "Impact", path: "/impact", icon: Leaf },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d0d0d] border-r border-[#252525] flex flex-col px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-14">
        <div className="bg-[#22e000] p-2.5 rounded-xl">
          <Droplets size={24} className="text-black" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            guardian<span className="text-[#22e000]">.</span>
          </h1>
          <p className="text-[10px] tracking-widest text-neutral-500">
            N₂O INTELLIGENCE
          </p>
        </div>
      </div>

      <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-500 px-3 mb-4">
        WORKSPACE
      </p>

      <nav className="space-y-1.5">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[#22e000]/10 text-[#22e000] border border-[#22e000]/15"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{name}</span>
            <ArrowUpRight
              size={13}
              className="opacity-0 group-hover:opacity-100"
            />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-5">
        <div className="border border-neutral-800 rounded-xl p-4 bg-[#121212]">
          <div className="flex items-center gap-2 mb-3">
            <Settings2 size={15} className="text-neutral-400" />
            <span className="text-xs text-neutral-300">
              System status
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22e000] animate-[status-pulse_2s_infinite]" />
            <span className="text-xs text-[#22e000]">
              Demo environment
            </span>
          </div>

          <p className="text-[10px] text-neutral-500 mt-2">
            Hardware not connected
          </p>
        </div>

        <div className="border-t border-neutral-800 pt-4 px-2">
          <p className="text-[10px] text-neutral-500 tracking-widest">
            GUARDIAN SYSTEMS
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            NSBE FRC 2026 · v0.1
          </p>
        </div>
      </div>
    </aside>
  );
}