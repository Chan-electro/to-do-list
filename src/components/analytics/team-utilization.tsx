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
  { name: "Self", tasks: 28 },
  { name: "Maneesh", tasks: 14 },
  { name: "Ashish", tasks: 11 },
  { name: "Likitesh", tasks: 9 },
  { name: "Sumeeth", tasks: 7 },
  { name: "Chandu", tasks: 5 },
];

// Gradient steps for bars — violet base, brightest for Self
const BAR_COLORS = [
  "#9B4FFF",
  "#7B2FFF",
  "#6B1FEF",
  "#5B0FDF",
  "#4B00CF",
  "#3B00BF",
];

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
          backgroundColor: "#12122A",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#E8E8F0",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <p style={{ color: "#8888AA", marginBottom: 2 }}>{label}</p>
        <p style={{ color: "#7B2FFF" }}>{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
}

export function TeamUtilization() {
  const maxTasks = Math.max(...TEAM_DATA.map((d) => d.tasks));

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "rgba(26,26,62,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono font-semibold text-[#8888AA] uppercase tracking-widest">
            Team Utilization
          </h2>
          <p className="text-[11px] text-[#8888AA]/50 font-mono mt-0.5">
            Task count by assignee
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#7B2FFF", boxShadow: "0 0 6px #7B2FFF60" }}
          />
          <span className="text-[11px] font-mono text-[#8888AA]">Active tasks</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={TEAM_DATA}
          margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#8888AA", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxTasks * 1.1)]}
            tick={{ fill: "#8888AA", fontSize: 11, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(123,47,255,0.06)" }} />
          <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
            {TEAM_DATA.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={BAR_COLORS[index]}
                style={{ filter: `drop-shadow(0 0 4px ${BAR_COLORS[index]}40)` }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Bottom stats row */}
      <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
        {TEAM_DATA.map((member, index) => {
          const pct = Math.round((member.tasks / TEAM_DATA.reduce((s, d) => s + d.tasks, 0)) * 100);
          return (
            <div
              key={member.name}
              className="flex flex-col items-center p-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="w-2 h-2 rounded-full mb-1"
                style={{ backgroundColor: BAR_COLORS[index] }}
              />
              <span className="text-[10px] font-mono text-[#8888AA] truncate w-full text-center">
                {member.name}
              </span>
              <span className="text-xs font-mono font-semibold text-[#E8E8F0]">
                {member.tasks}
              </span>
              <span className="text-[9px] font-mono text-[#8888AA]/60">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
