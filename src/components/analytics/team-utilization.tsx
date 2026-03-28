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

// Single blue for all bars — varying opacity for visual depth
const BAR_COLORS = [
  "#4B8EFF",
  "#4B8EFF",
  "#4B8EFF",
  "#4B8EFF",
  "#4B8EFF",
  "#4B8EFF",
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
          backgroundColor: "#0F1D30",
          border: "1px solid rgba(75,142,255,0.15)",
          borderRadius: "10px",
          padding: "8px 12px",
          color: "#F1F5F9",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <p style={{ color: "#94A3B8", marginBottom: 2 }}>{label}</p>
        <p style={{ color: "#4B8EFF" }}>{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
}

export function TeamUtilization() {
  const maxTasks = Math.max(...TEAM_DATA.map((d) => d.tasks));

  return (
    <div
      className="glass rounded-2xl p-5"
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono font-semibold text-[#94A3B8] uppercase tracking-widest">
            Team Utilization
          </h2>
          <p className="text-[11px] text-[#4B6080] font-mono mt-0.5">
            Task count by assignee
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4B8EFF]" />
          <span className="text-[11px] font-mono text-[#94A3B8]">Active tasks</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={TEAM_DATA}
          margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,142,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "rgba(75,142,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxTasks * 1.1)]}
            tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(75,142,255,0.04)" }} />
          <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
            {TEAM_DATA.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={BAR_COLORS[index]}
                opacity={1 - index * 0.1}
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
              style={{ background: "rgba(75, 142, 255, 0.03)" }}
            >
              <div
                className="w-2 h-2 rounded-full mb-1 bg-[#4B8EFF]"
                style={{ opacity: 1 - index * 0.1 }}
              />
              <span className="text-[10px] font-mono text-[#94A3B8] truncate w-full text-center">
                {member.name}
              </span>
              <span className="text-xs font-mono font-semibold text-[#F1F5F9]">
                {member.tasks}
              </span>
              <span className="text-[9px] font-mono text-[#4B6080]">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
