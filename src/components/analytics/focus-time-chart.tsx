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
          Focus Time
          <span className="text-[#4B6080] ml-1 normal-case font-normal">(hours/day)</span>
        </h2>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4B8EFF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4B8EFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,142,255,0.06)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(75,142,255,0.08)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(maxHours)]}
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
              formatter={(value) => [`${value}h`, "Focus"]}
              cursor={{ stroke: "rgba(75,142,255,0.15)" }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#4B8EFF"
              strokeWidth={2}
              fill="url(#focusGradient)"
              dot={{ fill: "#4B8EFF", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#93C5FD", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4B8EFF]" />
          <span className="text-[11px] font-mono text-[#94A3B8]">Daily focus hours</span>
        </div>
        {!isLoading && (
          <span className="text-[11px] font-mono text-[#4B8EFF]">
            Today: {focusHoursToday}h
          </span>
        )}
      </div>
    </div>
  );
}
