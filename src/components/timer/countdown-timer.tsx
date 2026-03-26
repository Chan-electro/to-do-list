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

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-mono uppercase tracking-widest text-[#7B2FFF] mb-6">
        Countdown
      </span>

      {/* Presets */}
      <div className="flex gap-2 mb-8">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => selectPreset(preset.seconds)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
              target === preset.seconds
                ? "bg-[#7B2FFF]/20 text-[#7B2FFF] border border-[#7B2FFF]/30"
                : "bg-white/[0.03] text-[#8888AA] hover:text-[#E8E8F0] border border-white/[0.06]"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Time Display */}
      <div className="text-6xl font-mono font-bold text-[#E8E8F0] mb-8">
        {formatTime(remaining)}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs h-1 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${target > 0 ? ((target - remaining) / target) * 100 : 0}%`,
            backgroundColor: "#7B2FFF",
          }}
        />
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
          className="w-12 h-12 rounded-full text-[#8888AA] hover:text-[#E8E8F0]"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setState(state === "running" ? "paused" : "running")}
          className="w-16 h-16 rounded-full bg-[#7B2FFF] hover:bg-[#7B2FFF]/90 text-white"
        >
          {state === "running" ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>

        <div className="w-12 h-12" /> {/* Spacer for alignment */}
      </div>
    </div>
  );
}
