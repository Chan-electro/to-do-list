"use client";

import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

const INTENSITY_COLORS = [
  "rgba(75, 142, 255, 0.04)",  // 0 - empty
  "rgba(75, 142, 255, 0.18)",  // 1 - low
  "rgba(75, 142, 255, 0.36)",  // 2 - medium
  "rgba(75, 142, 255, 0.58)",  // 3 - high
  "#4B8EFF",                   // 4 - max
];

export function WeeklyHeatmap() {
  const today = new Date();

  // Generate last 7 days with sample data
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return {
      date,
      label: format(date, "EEE"),
      fullDate: format(date, "MMM d"),
      isToday: i === 6,
      // Sample intensity - replace with real data later
      intensity: Math.floor(Math.random() * 5),
    };
  });

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-lg font-mono font-semibold text-[#F1F5F9] mb-4">
        This Week
      </h2>
      <div className="flex items-end justify-between gap-2">
        {days.map((day, index) => (
          <motion.div
            key={day.label}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-2 flex-1"
          >
            <div
              className="w-full aspect-square rounded-md transition-colors duration-200"
              style={{
                backgroundColor: INTENSITY_COLORS[day.intensity],
                boxShadow: day.isToday
                  ? "0 0 0 1.5px #4B8EFF"
                  : undefined,
              }}
              title={`${day.fullDate}: Level ${day.intensity}`}
            />
            <span
              className="text-[10px] font-mono"
              style={{
                color: day.isToday ? "#4B8EFF" : "#94A3B8",
              }}
            >
              {day.label}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-[#94A3B8]">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-[10px] text-[#94A3B8]">More</span>
      </div>
    </div>
  );
}
