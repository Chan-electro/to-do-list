"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

const INTENSITY_COLORS = [
  "rgba(37, 99, 235, 0.06)",   // 0 – empty
  "rgba(37, 99, 235, 0.18)",   // 1 – low
  "rgba(37, 99, 235, 0.36)",   // 2 – medium
  "rgba(37, 99, 235, 0.58)",   // 3 – high
  "#2563EB",                    // 4 – max
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

  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-5">
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: "#0F172A", fontFamily: "var(--font-playfair), serif" }}
        >
          This Week
        </h2>
        <div className="flex items-end justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full aspect-square rounded-md skeleton"
              />
              <span className="text-[10px] font-mono text-[#94A3B8]">···</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h2
        className="text-base font-semibold mb-4"
        style={{ color: "#0F172A", fontFamily: "var(--font-playfair), serif" }}
      >
        This Week
      </h2>

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
                  ? "0 0 0 1.5px #2563EB, 0 0 8px rgba(37,99,235,0.15)"
                  : undefined,
              }}
              title={`${day.fullDate}: ${day.intensity === 0 ? "No activity" : `Level ${day.intensity}`}`}
            />
            <span
              className="text-[10px] font-mono select-none"
              style={{ color: day.isToday ? "#2563EB" : "#94A3B8" }}
            >
              {day.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4">
        <span className="text-[10px] text-[#94A3B8]">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: color, border: "1px solid rgba(15,23,42,0.06)" }}
          />
        ))}
        <span className="text-[10px] text-[#94A3B8]">More</span>
      </div>
    </div>
  );
}
