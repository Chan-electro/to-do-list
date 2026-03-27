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
          Task Velocity
          <span className="text-[#8888AA]/50 ml-1 normal-case font-normal">(7 days)</span>
        </h2>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#8888AA", fontSize: 11, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 20]}
              tick={{ fill: "#8888AA", fontSize: 11, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#12122A",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                color: "#E8E8F0",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#8888AA" }}
              cursor={{ stroke: "rgba(0,212,255,0.15)" }}
            />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="#00D4FF"
              strokeWidth={2}
              dot={{ fill: "#00D4FF", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#00D4FF", stroke: "rgba(0,212,255,0.3)", strokeWidth: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
        <span className="text-[11px] font-mono text-[#8888AA]">Tasks completed per day</span>
      </div>
    </div>
  );
}
