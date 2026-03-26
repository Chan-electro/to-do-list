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
    <div className="glass rounded-xl p-6 glow-cyan">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Time Display */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-5xl md:text-6xl font-bold text-[#00D4FF]">
              {hours}
            </span>
            <span className="text-5xl md:text-6xl font-bold text-[#00D4FF]/50 animate-pulse">
              :
            </span>
            <span className="text-5xl md:text-6xl font-bold text-[#00D4FF]">
              {minutes}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-[#00D4FF]/40 ml-1">
              {seconds}
            </span>
          </div>
          <p className="text-sm text-[#8888AA] mt-1 font-mono">{dateStr}</p>
          <p className="text-xs text-[#8888AA]/60 mt-0.5">IST (Asia/Kolkata)</p>
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
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="4"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="#00D4FF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-mono font-bold text-[#E8E8F0]">
                {completionPercent}%
              </span>
              <span className="text-[10px] text-[#8888AA]">TODAY</span>
            </div>
          </div>

          {/* Quick Status Indicators */}
          <div className="hidden md:flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Timer className="w-4 h-4 text-[#8888AA]" />
              <span className="text-[#8888AA]">No active timer</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-[#00FF88]" />
              <span className="text-[#00FF88]">System Online</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#8888AA]" />
              <span className="text-[#8888AA]">0h focused today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
