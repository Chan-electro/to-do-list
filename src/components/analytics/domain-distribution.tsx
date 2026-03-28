"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const DOMAIN_DATA = [
  { name: "Personal",     value: 18, color: "#10B981" },
  { name: "Professional", value: 24, color: "#2563EB" },
  { name: "AdGrades",     value: 32, color: "#7C3AED" },
  { name: "Pure Blend",   value: 14, color: "#F59E0B" },
  { name: "Fresh & Fluffy", value: 12, color: "#EF4444" },
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
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "10px",
          padding: "8px 12px",
          color: "#0F172A",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: "12px",
          boxShadow: "0 4px 16px rgba(15,23,42,0.1)",
        }}
      >
        <p style={{ color: item.payload.color, marginBottom: 2, fontWeight: 600 }}>
          {item.name}
        </p>
        <p style={{ color: "#475569" }}>{item.value} tasks</p>
      </div>
    );
  }
  return null;
}

export function DomainDistribution() {
  const total = DOMAIN_DATA.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col card-lift">
      {/* Header */}
      <div className="mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
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
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-2xl font-bold"
              style={{ color: "#0F172A", fontFamily: "var(--font-jetbrains), monospace" }}
            >
              {total}
            </span>
            <span
              className="text-[10px] tracking-wider"
              style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              TASKS
            </span>
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
                <span
                  className="text-xs"
                  style={{ color: "#475569", fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  {domain.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#0F172A", fontFamily: "var(--font-jetbrains), monospace" }}
                >
                  {domain.value}
                </span>
                <span
                  className="text-[10px] w-8 text-right"
                  style={{ color: "#94A3B8" }}
                >
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
