
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: MetricCardProps) {
  return (
    <div className="panel p-5 transition-colors">
      <div className="flex justify-between items-center mb-5">
        <p className="text-xs text-neutral-400">
          {title}
        </p>

        <div className="border border-neutral-800 bg-white/[0.03] rounded-lg p-2">
          <Icon size={17} className={color} />
        </div>
      </div>

      <h2 className={`text-3xl font-semibold tracking-tight ${color}`}>
        {value}
      </h2>

      <div className="flex items-center gap-2 mt-3">
        <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full" />
        <p className="text-[11px] text-neutral-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}