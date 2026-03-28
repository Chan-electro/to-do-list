"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Timer, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export function HeroStatus() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  const { data: summary } = trpc.dashboard.getSummary.useQuery();

  useEffect(() => {
    const now = new Date();
    setTime(now);
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const completionPercent = summary
    ? Math.round((summary.tasks.completedToday / Math.max(summary.tasks.total, 1)) * 100)
    : 0;

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  const focusMins = summary?.timer?.focusMinutesToday ?? 0;
  const focusDisplay = focusMins >= 60
    ? `${Math.floor(focusMins / 60)}h ${focusMins % 60}m`
    : `${focusMins}m`;

  return (
    <div className="glass rounded-2xl p-6 glow-blue relative overflow-hidden">
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(75,142,255,0.07), transparent 60%)",
        }}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Clock */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-baseline gap-1 font-mono" suppressHydrationWarning>
            <span className="text-5xl md:text-6xl font-bold" style={{ color: "#4B8EFF" }} suppressHydrationWarning>
              {mounted && time ? format(time, "HH") : "––"}
            </span>
            <span
              className="text-5xl md:text-6xl font-bold animate-pulse"
              style={{ color: "rgba(75,142,255,0.45)" }}
            >
              :
            </span>
            <span className="text-5xl md:text-6xl font-bold" style={{ color: "#4B8EFF" }} suppressHydrationWarning>
              {mounted && time ? format(time, "mm") : "––"}
            </span>
            <span
              className="text-2xl md:text-3xl font-bold ml-1"
              style={{ color: "rgba(75,142,255,0.35)" }}
              suppressHydrationWarning
            >
              {mounted && time ? format(time, "ss") : "––"}
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1 font-mono" suppressHydrationWarning>
            {mounted && time ? format(time, "EEEE, MMMM d, yyyy") : "Loading…"}
          </p>
          <p className="text-xs text-[#4B6080] mt-0.5">IST (Asia/Kolkata)</p>
        </div>

        {/* Completion ring + status */}
        <div className="flex items-center gap-8">
          {/* Ring */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48" cy="48" r="42"
                fill="none"
                stroke="rgba(75,142,255,0.1)"
                strokeWidth="5"
              />
              <motion.circle
                cx="48" cy="48" r="42"
                fill="none"
                stroke="#4B8EFF"
                strokeWidth="5"
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
              <span className="text-[9px] text-[#94A3B8] tracking-wider uppercase">Today</span>
            </div>
          </div>

          {/* Status pills */}
          <div className="hidden md:flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <Activity className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="text-[#34D399] text-xs font-medium">System Online</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
              <Timer className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-[#94A3B8] text-xs">No active timer</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4B8EFF]" />
              <Clock className="w-3.5 h-3.5 text-[#4B8EFF]" />
              <span className="text-[#94A3B8] text-xs">
                <span className="text-[#4B8EFF] font-medium">{focusDisplay}</span> focused
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
