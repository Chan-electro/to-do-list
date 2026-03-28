"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { trpc } from "@/lib/trpc/client";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOCK_FOCUS_HOURS = [1.5, 2.8, 2.0, 3.5, 1.8, 2.5, 0];

export function FocusTimeChart() {
  const { data: timerStats, isLoading } = trpc.timer.getStats.useQuery();

  const focusHoursToday = timerStats
    ? Math.round((timerStats.totalFocusMinutesToday / 60) * 10) / 10
    : 0;

  const chartData = DAY_LABELS.map((day, i) => ({
    day,
    hours: i === 6 ? focusHoursToday : MOCK_FOCUS_HOURS[i],
  }));

  const maxHours = Math.max(...chartData.map((d) => d.hours), 4);

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col card-lift">
      {/* Header */}
      <div className="mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          Focus Time{" "}
          <span className="normal-case font-normal" style={{ color: "#CBD5E1" }}>
            (hours/day)
          </span>
        </h2>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "var(--font-dm-sans), sans-serif" }}
              axisLine={{ stroke: "rgba(15,23,42,0.07)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(maxHours)]}
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
              formatter={(value) => [`${value}h`, "Focus"]}
              cursor={{ stroke: "rgba(37,99,235,0.1)" }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#2563EB"
              strokeWidth={2}
              fill="url(#focusGradient)"
              dot={{ fill: "#2563EB", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#60A5FA", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#2563EB" }} />
          <span
            className="text-[11px]"
            style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Daily focus hours
          </span>
        </div>
        {!isLoading && (
          <span
            className="text-[11px] font-medium"
            style={{ color: "#2563EB", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Today: {focusHoursToday}h
          </span>
        )}
      </div>
    </div>
  );
}
