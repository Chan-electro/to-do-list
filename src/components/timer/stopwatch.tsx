"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Stopwatch() {
  const [state, setState] = useState<"idle" | "running" | "paused">("idle");
  const [seconds, setSeconds] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleLap = () => {
    setLaps((prev) => [...prev, seconds]);
  };

  const handleReset = () => {
    setState("idle");
    setSeconds(0);
    setLaps([]);
  };

  const btnBg = state === "running" ? "#EF4444" : "#2563EB";

  return (
    <div className="flex flex-col items-center">
      <span
        className="text-sm uppercase tracking-widest font-semibold mb-6"
        style={{ color: "#2563EB", fontFamily: "var(--font-dm-sans), sans-serif" }}
      >
        Stopwatch
      </span>

      {/* Time Display */}
      <motion.div
        className="mb-8 text-center"
        key={seconds}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 0.2 }}
      >
        <span
          className="text-6xl font-bold"
          style={{ color: "#0F172A", fontFamily: "var(--font-jetbrains), monospace" }}
        >
          {formatTime(seconds)}
        </span>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="w-12 h-12 rounded-full transition-colors duration-200"
          style={{ border: "1px solid rgba(15, 23, 42, 0.12)", color: "#64748B" }}
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
          style={{ backgroundColor: btnBg, color: "#FFFFFF" }}
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
          onClick={handleLap}
          disabled={state !== "running"}
          className="w-12 h-12 rounded-full transition-colors duration-200 disabled:opacity-40"
          style={{ border: "1px solid rgba(15,23,42,0.12)", color: "#2563EB" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(15,23,42,0.12)";
          }}
        >
          <Flag className="w-5 h-5" />
        </Button>
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="mt-6 w-full max-w-xs space-y-0">
          {laps.map((lapTime, i) => {
            const prevLap = i > 0 ? laps[i - 1] : 0;
            const split = lapTime - (prevLap ?? 0);
            return (
              <div
                key={i}
                className="flex justify-between text-sm py-2"
                style={{
                  borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                <span style={{ color: "#94A3B8" }}>Lap {i + 1}</span>
                <span style={{ color: "#64748B" }}>{formatTime(split)}</span>
                <span style={{ color: "#0F172A", fontWeight: 500 }}>{formatTime(lapTime)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
