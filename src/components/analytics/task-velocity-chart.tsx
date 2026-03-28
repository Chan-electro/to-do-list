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
  const { data: stats } = trpc.task.getStats.useQuery();

  const tasksToday = (stats as Record<string, number> | undefined)?.done ?? 0;

  const mockBase = [3, 7, 5, 8, 4, 6, tasksToday];
  const chartData = DAY_LABELS.map((day, i) => ({
    day,
    tasks: mockBase[i],
  }));

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col card-lift">
      {/* Header */}
      <div className="mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          Task Velocity{" "}
          <span className="normal-case font-normal" style={{ color: "#CBD5E1" }}>
            (7 days)
          </span>
        </h2>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "var(--font-dm-sans), sans-serif" }}
              axisLine={{ stroke: "rgba(15,23,42,0.07)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 20]}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: "10px",
                color: "#0F172A",
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(15,23,42,0.1)",
              }}
              labelStyle={{ color: "#64748B" }}
              cursor={{ stroke: "rgba(37,99,235,0.1)" }}
            />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#60A5FA", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: "#2563EB" }} />
        <span
          className="text-[11px]"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          Tasks completed per day
        </span>
      </div>
    </div>
  );
}
