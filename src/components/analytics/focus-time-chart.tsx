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
          Focus Time
          <span className="text-[#8888AA]/50 ml-1 normal-case font-normal">(hours/day)</span>
        </h2>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#8888AA", fontSize: 11, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(maxHours)]}
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
              formatter={(value) => [`${value}h`, "Focus"]}
              cursor={{ stroke: "rgba(0,212,255,0.15)" }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#00D4FF"
              strokeWidth={2}
              fill="url(#focusGradient)"
              dot={{ fill: "#00D4FF", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#00D4FF", stroke: "rgba(0,212,255,0.3)", strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
          <span className="text-[11px] font-mono text-[#8888AA]">Daily focus hours</span>
        </div>
        {!isLoading && (
          <span className="text-[11px] font-mono text-[#00D4FF]">
            Today: {focusHoursToday}h
          </span>
        )}
      </div>
    </div>
  );
}
