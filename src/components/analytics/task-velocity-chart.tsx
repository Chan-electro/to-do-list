"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { trpc } from "@/lib/trpc/client";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TaskVelocityChart() {
  const { data: stats, isLoading } = trpc.task.getStats.useQuery();

  const tasksToday = (stats as Record<string, number> | undefined)?.done ?? 0;

  const mockBase = [3, 7, 5, 8, 4, 6, tasksToday];
  const chartData = DAY_LABELS.map((day, i) => ({
    day,
    tasks: mockBase[i],
  }));

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
          Task Velocity
          <span className="text-[#4B6080] ml-1 normal-case font-normal">(7 days)</span>
        </h2>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,142,255,0.06)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(75,142,255,0.08)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 20]}
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F1D30",
                border: "1px solid rgba(75,142,255,0.15)",
                borderRadius: "10px",
                color: "#F1F5F9",
                fontSize: 12,
              }}
              labelStyle={{ color: "#94A3B8" }}
              cursor={{ stroke: "rgba(75,142,255,0.15)" }}
            />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="#4B8EFF"
              strokeWidth={2}
              dot={{ fill: "#4B8EFF", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#93C5FD", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#4B8EFF]" />
        <span className="text-[11px] font-mono text-[#94A3B8]">Tasks completed per day</span>
      </div>
    </div>
  );
}
