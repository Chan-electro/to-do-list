"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const TEAM_DATA = [
  { name: "Self",     tasks: 28 },
  { name: "Maneesh",  tasks: 14 },
  { name: "Ashish",   tasks: 11 },
  { name: "Likitesh", tasks: 9 },
  { name: "Sumeeth",  tasks: 7 },
  { name: "Chandu",   tasks: 5 },
];

// Blue shades with decreasing opacity for depth
const BAR_COLORS = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
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
        <p style={{ color: "#64748B", marginBottom: 2 }}>{label}</p>
        <p style={{ color: "#2563EB", fontWeight: 600 }}>{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
}

export function TeamUtilization() {
  const maxTasks = Math.max(...TEAM_DATA.map((d) => d.tasks));
  const totalTasks = TEAM_DATA.reduce((s, d) => s + d.tasks, 0);

  return (
    <div className="glass rounded-2xl p-5 card-lift">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Team Utilization
          </h2>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Task count by assignee
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#2563EB" }} />
          <span
            className="text-[11px]"
            style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Active tasks
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={TEAM_DATA}
          margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(15,23,42,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "var(--font-dm-sans), sans-serif" }}
            axisLine={{ stroke: "rgba(15,23,42,0.07)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxTasks * 1.1)]}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(37,99,235,0.04)" }}
          />
          <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
            {TEAM_DATA.map((entry, index) => (
              <Cell key={entry.name} fill={BAR_COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Bottom stats row */}
      <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
        {TEAM_DATA.map((member, index) => {
          const pct = Math.round((member.tasks / totalTasks) * 100);
          return (
            <div
              key={member.name}
              className="flex flex-col items-center p-2 rounded-xl"
              style={{
                background: "rgba(37, 99, 235, 0.03)",
                border: "1px solid rgba(15,23,42,0.04)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full mb-1"
                style={{ backgroundColor: BAR_COLORS[index] }}
              />
              <span
                className="text-[10px] truncate w-full text-center"
                style={{ color: "#64748B", fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                {member.name}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: "#0F172A", fontFamily: "var(--font-jetbrains), monospace" }}
              >
                {member.tasks}
              </span>
              <span
                className="text-[9px]"
                style={{ color: "#94A3B8" }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
