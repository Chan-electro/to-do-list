"use client";

import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

const INTENSITY_COLORS = [
  "rgba(255,255,255,0.04)", // 0 - empty
  "rgba(0,212,255,0.2)",    // 1 - low
  "rgba(0,212,255,0.4)",    // 2 - medium
  "rgba(0,212,255,0.65)",   // 3 - high
  "#00D4FF",                // 4 - max
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
      // Sample intensity - replace with real data later
      intensity: Math.floor(Math.random() * 5),
    };
  });

  return (
    <div className="glass rounded-xl p-5">
      <h2 className="text-lg font-mono font-semibold text-[#E8E8F0] mb-4">
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
              className="w-full aspect-square rounded-md transition-colors"
              style={{ backgroundColor: INTENSITY_COLORS[day.intensity] }}
              title={`${day.fullDate}: Level ${day.intensity}`}
            />
            <span className="text-[10px] font-mono text-[#8888AA]">
              {day.label}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-[#8888AA]">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-[10px] text-[#8888AA]">More</span>
      </div>
    </div>
  );
}
