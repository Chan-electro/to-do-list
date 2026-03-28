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
        <span className="font-mono text-[10px] text-[#94A3B8]">
          90-day rate
        </span>
        <span className="font-mono text-[10px] text-[#94A3B8]">
          {rate}%
        </span>
      </div>
      <Progress
        value={rate}
        className="h-1"
        style={
          {
            background: "rgba(75,142,255,0.08)",
            "--progress-color": "#4B8EFF",
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function StatCard({ habit }: { habit: StreakEntry }) {
  const streak = habit.streakCurrent;
  const streakColor = streak >= 7 ? "#34D399" : streak > 0 ? "#FCD34D" : "#94A3B8";

  return (
    <div
      className="glass rounded-2xl p-4 transition-all duration-200"
      style={{
        border: "1px solid rgba(75,142,255,0.1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(75,142,255,0.25)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(75,142,255,0.1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Name row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#4B8EFF" }}
          />
          <span className="font-mono text-sm font-medium truncate text-[#F1F5F9]">
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
          <p className="font-mono text-[10px] mb-0.5 text-[#94A3B8]">
            Current
          </p>
          <p className="font-mono text-lg font-bold leading-none" style={{ color: streakColor }}>
            {streak}
            <span className="font-mono text-[10px] font-normal ml-1 text-[#94A3B8]">
              day{streak !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] mb-0.5 text-[#94A3B8]">
            Best
          </p>
          <p
            className="font-mono text-lg font-bold leading-none"
            style={{ color: "#8B5CF6" }}
          >
            {habit.streakBest}
            <span className="font-mono text-[10px] font-normal ml-1 text-[#94A3B8]">
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
            className="h-28 rounded-2xl animate-pulse"
            style={{ background: "#0F1D30" }}
          />
        ))}
      </div>
    );
  }

  if (!streaks || streaks.length === 0) {
    return (
      <div
        className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center"
        style={{
          border: "1px solid rgba(75,142,255,0.1)",
        }}
      >
        <Flame className="w-8 h-8 mb-2" style={{ color: "rgba(75,142,255,0.3)" }} />
        <p className="font-mono text-sm text-[#94A3B8]">
          No streak data yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-mono text-xs uppercase tracking-widest text-[#94A3B8]">
        Streak Stats
      </h2>
      {streaks.map((habit) => (
        <StatCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
