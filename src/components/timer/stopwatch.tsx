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

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-mono uppercase tracking-widest text-[#4B8EFF] mb-6">
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
        <span className="text-6xl font-mono font-semibold text-[#F1F5F9]">
          {formatTime(seconds)}
        </span>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="w-12 h-12 rounded-full text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-200"
          style={{ border: "1px solid rgba(75,142,255,0.2)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(75,142,255,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(75,142,255,0.2)";
          }}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setState(state === "running" ? "paused" : "running")}
          className="w-16 h-16 rounded-xl active:scale-[0.97] transition-all duration-200 font-bold text-[#060B14]"
          style={{
            backgroundColor: state === "running" ? "#F87171" : "#4B8EFF",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              state === "running" ? "#FF8080" : "#5B9EFF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              state === "running" ? "#F87171" : "#4B8EFF";
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
          onClick={handleLap}
          disabled={state !== "running"}
          className="w-12 h-12 rounded-full text-[#4B8EFF] transition-colors duration-200 disabled:opacity-40"
          style={{ border: "1px solid rgba(75,142,255,0.2)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(75,142,255,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(75,142,255,0.2)";
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
            const split = lapTime - prevLap;
            return (
              <div
                key={i}
                className="flex justify-between text-sm font-mono py-2"
                style={{ borderBottom: "1px solid rgba(75,142,255,0.06)" }}
              >
                <span className="text-[#4B6080]">Lap {i + 1}</span>
                <span className="text-[#94A3B8]">{formatTime(split)}</span>
                <span className="text-[#F1F5F9]">{formatTime(lapTime)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
