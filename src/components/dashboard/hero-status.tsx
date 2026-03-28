"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Timer, Activity } from "lucide-react";

export function HeroStatus() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = format(time, "HH");
  const minutes = format(time, "mm");
  const seconds = format(time, "ss");
  const dateStr = format(time, "EEEE, MMMM d, yyyy");

  // Placeholder completion percentage
  const completionPercent = 35;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="glass rounded-2xl p-6 glow-blue relative overflow-hidden">
      {/* Soft blue gradient overlay */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background:
            "radial-gradient(circle at 80% 20%, rgba(75, 142, 255, 0.06), transparent 60%)",
        }}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
        {/* Time Display */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-5xl md:text-6xl font-bold text-[#4B8EFF]">
              {hours}
            </span>
            <span className="text-5xl md:text-6xl font-bold text-[#4B8EFF]/50 animate-pulse">
              :
            </span>
            <span className="text-5xl md:text-6xl font-bold text-[#4B8EFF]">
              {minutes}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-[#4B8EFF]/40 ml-1">
              {seconds}
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1 font-mono">{dateStr}</p>
          <p className="text-xs text-[#4B6080] mt-0.5">IST (Asia/Kolkata)</p>
        </div>

        {/* Completion Ring */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="rgba(75, 142, 255, 0.1)"
                strokeWidth="4"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="#4B8EFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-mono font-bold text-[#F1F5F9]">
                {completionPercent}%
              </span>
              <span className="text-[10px] text-[#94A3B8]">TODAY</span>
            </div>
          </div>

          {/* Quick Status Indicators */}
          <div className="hidden md:flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Timer className="w-4 h-4 text-[#94A3B8]" />
              <span className="text-[#94A3B8]">No active timer</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-[#34D399]" />
              <span className="text-[#34D399]">System Online</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#94A3B8]" />
              <span className="text-[#94A3B8]">0h focused today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
