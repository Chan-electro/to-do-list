"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

const INTENSITY_COLORS = [
  "rgba(75, 142, 255, 0.05)",  // 0 – empty
  "rgba(75, 142, 255, 0.20)",  // 1 – low
  "rgba(75, 142, 255, 0.40)",  // 2 – medium
  "rgba(75, 142, 255, 0.65)",  // 3 – high
  "#4B8EFF",                   // 4 – max
];

interface DayData {
  label: string;
  fullDate: string;
  isToday: boolean;
  intensity: number;
}

export function WeeklyHeatmap() {
  const [days, setDays] = useState<DayData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const today = new Date();
    const generated: DayData[] = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      // deterministic-ish intensity from day-of-month so it looks realistic
      const seed = date.getDate() * 7 + date.getMonth();
      return {
        label: format(date, "EEE"),
        fullDate: format(date, "MMM d"),
        isToday: i === 6,
        intensity: seed % 5,
      };
    });
    setDays(generated);
    setMounted(true);
  }, []);

  // Skeleton placeholder until mounted (avoids hydration mismatch)
  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-5">
        <h2 className="text-base font-semibold text-[#F1F5F9] mb-4">This Week</h2>
        <div className="flex items-end justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full aspect-square rounded-md"
                style={{ backgroundColor: "rgba(75, 142, 255, 0.05)" }}
              />
              <span className="text-[10px] font-mono text-[#4B6080]">···</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-base font-semibold text-[#F1F5F9] mb-4">This Week</h2>

      <div className="flex items-end justify-between gap-2">
        {days.map((day, index) => (
          <motion.div
            key={day.label}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 24 }}
            className="flex flex-col items-center gap-2 flex-1"
            style={{ transformOrigin: "bottom" }}
          >
            <div
              className="w-full aspect-square rounded-md transition-all duration-200 hover:scale-110 cursor-default"
              style={{
                backgroundColor: INTENSITY_COLORS[day.intensity],
                boxShadow: day.isToday
                  ? "0 0 0 1.5px #4B8EFF, 0 0 12px rgba(75,142,255,0.2)"
                  : undefined,
              }}
              title={`${day.fullDate}: ${day.intensity === 0 ? "No activity" : `Level ${day.intensity}`}`}
            />
            <span
              className="text-[10px] font-mono select-none"
              style={{ color: day.isToday ? "#4B8EFF" : "#94A3B8" }}
            >
              {day.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4">
        <span className="text-[10px] text-[#4B6080]">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-[10px] text-[#4B6080]">More</span>
      </div>
    </div>
  );
}
