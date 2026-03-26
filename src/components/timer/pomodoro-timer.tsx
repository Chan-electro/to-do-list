"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, AlertCircle, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores/timer-store";

export function PomodoroTimer() {
  const {
    state,
    seconds,
    targetSeconds,
    distractions,
    pomodoroCount,
    isBreak,
    start,
    pause,
    reset,
    tick,
    logDistraction,
    completePomodoroSession,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, tick]);

  // Auto-complete when target reached
  useEffect(() => {
    if (state === "running" && seconds >= targetSeconds && targetSeconds > 0) {
      if (!isBreak) {
        completePomodoroSession();
      } else {
        reset();
      }
    }
  }, [seconds, targetSeconds, state, isBreak, completePomodoroSession, reset]);

  const remaining = Math.max(0, targetSeconds - seconds);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = targetSeconds > 0 ? (seconds / targetSeconds) * 100 : 0;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const accentColor = isBreak ? "#00FF88" : "#00D4FF";

  return (
    <div className="flex flex-col items-center">
      {/* Status Label */}
      <div className="flex items-center gap-2 mb-6">
        {isBreak ? (
          <Coffee className="w-5 h-5 text-[#00FF88]" />
        ) : null}
        <span
          className="text-sm font-mono uppercase tracking-widest"
          style={{ color: accentColor }}
        >
          {isBreak ? "Break Time" : "Focus Session"}
        </span>
      </div>

      {/* Timer Ring */}
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-64 h-64 -rotate-90" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
          />
          <motion.circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke={accentColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
            style={{
              filter: `drop-shadow(0 0 8px ${accentColor}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-bold text-[#E8E8F0]">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span className="text-xs text-[#8888AA] mt-2 font-mono">
            {pomodoroCount} sessions completed
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="w-12 h-12 rounded-full text-[#8888AA] hover:text-[#E8E8F0] hover:bg-white/[0.05]"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={state === "running" ? pause : start}
          className="w-16 h-16 rounded-full text-lg font-bold"
          style={{
            backgroundColor: accentColor,
            color: "#0A0A1A",
          }}
        >
          {state === "running" ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={logDistraction}
          disabled={state !== "running"}
          className="w-12 h-12 rounded-full text-[#8888AA] hover:text-[#FF3366] hover:bg-[#FF3366]/10"
          title="Log distraction"
        >
          <AlertCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Distraction Counter */}
      {distractions > 0 && (
        <p className="text-xs text-[#FF3366] mt-4 font-mono">
          {distractions} distraction{distractions !== 1 ? "s" : ""} logged
        </p>
      )}
    </div>
  );
}
