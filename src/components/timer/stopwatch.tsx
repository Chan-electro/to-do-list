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
      <span className="text-sm font-mono uppercase tracking-widest text-[#FFB800] mb-6">
        Stopwatch
      </span>

      {/* Time Display */}
      <motion.div
        className="text-6xl font-mono font-bold text-[#E8E8F0] mb-8"
        key={seconds}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 0.2 }}
      >
        {formatTime(seconds)}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="w-12 h-12 rounded-full text-[#8888AA] hover:text-[#E8E8F0]"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setState(state === "running" ? "paused" : "running")}
          className="w-16 h-16 rounded-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#0A0A1A]"
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
          className="w-12 h-12 rounded-full text-[#8888AA] hover:text-[#FFB800]"
        >
          <Flag className="w-5 h-5" />
        </Button>
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="mt-6 w-full max-w-xs space-y-1">
          {laps.map((lapTime, i) => {
            const prevLap = i > 0 ? laps[i - 1] : 0;
            const split = lapTime - prevLap;
            return (
              <div
                key={i}
                className="flex justify-between text-sm font-mono text-[#8888AA]"
              >
                <span>Lap {i + 1}</span>
                <span>{formatTime(split)}</span>
                <span className="text-[#E8E8F0]">{formatTime(lapTime)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
