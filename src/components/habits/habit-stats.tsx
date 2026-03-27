"use client";

import { Flame } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Progress } from "@/components/ui/progress";

interface StreakEntry {
  id: string;
  name: string;
  streakCurrent: number;
  streakBest: number;
  color: string | null;
  icon: string | null;
}

function CompletionRate({ habitId }: { habitId: string }) {
  const { data: logs } = trpc.habit.getHeatmap.useQuery({ habitId });

  if (!logs) return null;

  const total = logs.length;
  const completed = logs.filter((l) => l.completed).length;
  const rate = total === 0 ? 0 : Math.round((completed / Math.min(total, 90)) * 100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px]" style={{ color: "#8888AA" }}>
          90-day rate
        </span>
        <span className="font-mono text-[10px]" style={{ color: "#8888AA" }}>
          {rate}%
        </span>
      </div>
      <Progress
        value={rate}
        className="h-1 bg-white/[0.06]"
        style={
          {
            "--progress-color": rate >= 70 ? "#00FF88" : rate >= 40 ? "#FFB800" : "#FF3366",
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function StatCard({ habit }: { habit: StreakEntry }) {
  const streak = habit.streakCurrent;
  const streakColor = streak >= 7 ? "#00FF88" : streak > 0 ? "#FFB800" : "#8888AA";
  const habitColor = habit.color ?? "#00D4FF";

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{
        background: "rgba(26,26,62,0.6)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Name row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: habitColor }}
          />
          <span
            className="font-mono text-sm font-medium truncate"
            style={{ color: "#E8E8F0" }}
          >
            {habit.name}
          </span>
        </div>

        {/* Current streak badge */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Flame className="w-3.5 h-3.5" style={{ color: streakColor }} />
          <span className="font-mono text-sm font-bold" style={{ color: streakColor }}>
            {streak}
          </span>
        </div>
      </div>

      {/* Streak details */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        <div>
          <p className="font-mono text-[10px] mb-0.5" style={{ color: "#8888AA" }}>
            Current
          </p>
          <p className="font-mono text-lg font-bold leading-none" style={{ color: streakColor }}>
            {streak}
            <span
              className="font-mono text-[10px] font-normal ml-1"
              style={{ color: "#8888AA" }}
            >
              day{streak !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] mb-0.5" style={{ color: "#8888AA" }}>
            Best
          </p>
          <p
            className="font-mono text-lg font-bold leading-none"
            style={{ color: "#7B2FFF" }}
          >
            {habit.streakBest}
            <span
              className="font-mono text-[10px] font-normal ml-1"
              style={{ color: "#8888AA" }}
            >
              day{habit.streakBest !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
      </div>

      <CompletionRate habitId={habit.id} />
    </div>
  );
}

export function HabitStats() {
  const { data: streaks, isLoading } = trpc.habit.getStreaks.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl animate-pulse"
            style={{ background: "rgba(26,26,62,0.6)" }}
          />
        ))}
      </div>
    );
  }

  if (!streaks || streaks.length === 0) {
    return (
      <div
        className="rounded-xl p-8 flex flex-col items-center justify-center text-center"
        style={{
          background: "rgba(26,26,62,0.6)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Flame className="w-8 h-8 mb-2" style={{ color: "rgba(255,184,0,0.3)" }} />
        <p className="font-mono text-sm" style={{ color: "#8888AA" }}>
          No streak data yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-mono text-xs uppercase tracking-widest" style={{ color: "#8888AA" }}>
        Streak Stats
      </h2>
      {streaks.map((habit) => (
        <StatCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
