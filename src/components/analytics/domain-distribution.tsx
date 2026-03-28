"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const DOMAIN_DATA = [
  { name: "Personal", value: 18, color: "#34D399" },
  { name: "Professional", value: 24, color: "#4B8EFF" },
  { name: "AdGrades", value: 32, color: "#8B5CF6" },
  { name: "Pure Blend", value: 14, color: "#FCD34D" },
  { name: "Fresh & Fluffy", value: 12, color: "#F87171" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        style={{
          backgroundColor: "#0F1D30",
          border: "1px solid rgba(75,142,255,0.15)",
          borderRadius: "10px",
          padding: "8px 12px",
          color: "#F1F5F9",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <p style={{ color: item.payload.color, marginBottom: 2 }}>{item.name}</p>
        <p style={{ color: "#F1F5F9" }}>{item.value} tasks</p>
      </div>
    );
  }
  return null;
}

export function DomainDistribution() {
  const total = DOMAIN_DATA.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className="glass rounded-2xl p-5 h-full flex flex-col"
      style={{
        background: "rgba(11, 21, 36, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(75, 142, 255, 0.12)",
        transition: "border-color 200ms ease, transform 200ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(75, 142, 255, 0.25)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(75, 142, 255, 0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-mono font-semibold text-[#94A3B8] uppercase tracking-widest">
          Domain Distribution
        </h2>
      </div>

      {/* Donut Chart */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={DOMAIN_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {DOMAIN_DATA.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}30)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-mono font-bold text-[#F1F5F9]">{total}</span>
            <span className="text-[10px] text-[#94A3B8] font-mono tracking-wider">TASKS</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {DOMAIN_DATA.map((domain) => {
          const pct = Math.round((domain.value / total) * 100);
          return (
            <div key={domain.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: domain.color }}
                />
                <span className="text-xs font-mono text-[#94A3B8]">{domain.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#F1F5F9]">{domain.value}</span>
                <span className="text-[10px] font-mono text-[#4B6080] w-8 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
