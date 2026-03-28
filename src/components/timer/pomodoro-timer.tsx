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

  const accentColor = isBreak ? "#10B981" : "#2563EB";
  const trackColor = isBreak ? "rgba(16, 185, 129, 0.12)" : "rgba(37, 99, 235, 0.1)";

  return (
    <div className="flex flex-col items-center">
      {/* Status Label */}
      <div className="flex items-center gap-2 mb-6">
        {isBreak ? (
          <Coffee className="w-5 h-5" style={{ color: "#10B981" }} />
        ) : null}
        <span
          className="text-sm uppercase tracking-widest font-semibold"
          style={{
            color: accentColor,
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
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
            stroke={trackColor}
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
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-7xl font-bold"
            style={{
              color: "#0F172A",
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span
            className="text-xs mt-2"
            style={{ color: "#64748B", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
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
          className="w-12 h-12 rounded-full transition-colors duration-200"
          style={{
            border: "1px solid rgba(15, 23, 42, 0.12)",
            color: "#64748B",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.3)";
            (e.currentTarget as HTMLButtonElement).style.color = "#2563EB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(15,23,42,0.12)";
            (e.currentTarget as HTMLButtonElement).style.color = "#64748B";
          }}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={state === "running" ? pause : start}
          className="w-16 h-16 rounded-xl py-3 px-8 text-lg font-bold active:scale-[0.97] transition-all duration-200 shadow-md"
          style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
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
          className="w-12 h-12 rounded-full transition-colors duration-200"
          style={{
            border: "1px solid rgba(15, 23, 42, 0.12)",
            color: "#64748B",
          }}
          title="Log distraction"
        >
          <AlertCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Distraction Counter */}
      {distractions > 0 && (
        <p
          className="text-xs mt-4"
          style={{ color: "#EF4444", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          {distractions} distraction{distractions !== 1 ? "s" : ""} logged
        </p>
      )}
    </div>
  );
}
