"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const DOMAIN_DATA = [
  { name: "Personal", value: 18, color: "#00FF88" },
  { name: "Professional", value: 24, color: "#00D4FF" },
  { name: "AdGrades", value: 32, color: "#7B2FFF" },
  { name: "Pure Blend", value: 14, color: "#FFB800" },
  { name: "Fresh & Fluffy", value: 12, color: "#FF3366" },
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
          backgroundColor: "#12122A",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#E8E8F0",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <p style={{ color: item.payload.color, marginBottom: 2 }}>{item.name}</p>
        <p style={{ color: "#E8E8F0" }}>{item.value} tasks</p>
      </div>
    );
  }
  return null;
}

export function DomainDistribution() {
  const total = DOMAIN_DATA.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className="rounded-xl p-6 h-full flex flex-col"
      style={{
        background: "rgba(26,26,62,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-mono font-semibold text-[#8888AA] uppercase tracking-widest">
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
                    style={{ filter: `drop-shadow(0 0 6px ${entry.color}40)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-mono font-bold text-[#E8E8F0]">{total}</span>
            <span className="text-[10px] text-[#8888AA] font-mono tracking-wider">TASKS</span>
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
                  style={{ backgroundColor: domain.color, boxShadow: `0 0 6px ${domain.color}60` }}
                />
                <span className="text-xs font-mono text-[#8888AA]">{domain.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#E8E8F0]">{domain.value}</span>
                <span className="text-[10px] font-mono text-[#8888AA]/60 w-8 text-right">
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
