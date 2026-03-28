"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "5m", seconds: 5 * 60 },
  { label: "15m", seconds: 15 * 60 },
  { label: "30m", seconds: 30 * 60 },
  { label: "1h", seconds: 60 * 60 },
];

export function CountdownTimer() {
  const [state, setState] = useState<"idle" | "running" | "paused">("idle");
  const [remaining, setRemaining] = useState(5 * 60);
  const [target, setTarget] = useState(5 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setState("idle");
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const selectPreset = (secs: number) => {
    setTarget(secs);
    setRemaining(secs);
    setState("idle");
  };

  const pct = target > 0 ? (remaining / target) * 100 : 0;
  const ringColor =
    pct > 50 ? "#10B981" : pct > 20 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-center">
      <span
        className="text-sm uppercase tracking-widest font-semibold mb-6"
        style={{ color: "#2563EB", fontFamily: "var(--font-dm-sans), sans-serif" }}
      >
        Countdown
      </span>

      {/* Presets */}
      <div className="flex gap-2 mb-8">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => selectPreset(preset.seconds)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={
              target === preset.seconds
                ? {
                    background: "#DBEAFE",
                    color: "#1D4ED8",
                    border: "1px solid rgba(37,99,235,0.25)",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }
                : {
                    background: "#F8FAFC",
                    color: "#64748B",
                    border: "1px solid rgba(15,23,42,0.08)",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }
            }
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Ring + Time Display */}
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(15, 23, 42, 0.06)"
            strokeWidth="6"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={
              2 * Math.PI * 88 - (pct / 100) * 2 * Math.PI * 88
            }
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold"
            style={{ color: "#0F172A", fontFamily: "var(--font-jetbrains), monospace" }}
          >
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setState("idle");
            setRemaining(target);
          }}
          className="w-12 h-12 rounded-full transition-colors duration-200"
          style={{ border: "1px solid rgba(15,23,42,0.12)", color: "#64748B" }}
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
          onClick={() => setState(state === "running" ? "paused" : "running")}
          className="w-16 h-16 rounded-xl active:scale-[0.97] transition-all duration-200 font-bold shadow-md"
          style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1D4ED8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2563EB";
          }}
        >
          {state === "running" ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>

        <div className="w-12 h-12" />
      </div>
    </div>
  );
}
