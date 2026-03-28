"use client";

import { useState } from "react";
import { Plus, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { HabitCheckIn } from "@/components/habits/habit-check-in";
import { HabitStats } from "@/components/habits/habit-stats";
import { HabitHeatmap } from "@/components/habits/habit-heatmap";
import { HabitCreateDialog } from "@/components/habits/habit-create-dialog";
import { trpc } from "@/lib/trpc/client";

export default function HabitsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: habits } = trpc.habit.list.useQuery();
  const heatmapHabits = (habits ?? []).slice(0, 3);

  return (
    <AppShell>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: "var(--font-playfair), serif",
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              Habits
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>
              Track your daily disciplines
            </p>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="font-medium flex items-center gap-1.5 flex-shrink-0 active:scale-[0.97] transition-all duration-200"
            style={{ background: "#2563EB", color: "#FFFFFF" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
            }}
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Daily check-in (2/3 width) */}
          <div className="lg:col-span-2 space-y-3">
            <h2
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: "#64748B", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Today&apos;s Check-in
            </h2>
            <HabitCheckIn />
          </div>

          {/* Right: Stats (1/3 width) */}
          <div className="lg:col-span-1">
            <HabitStats />
          </div>
        </div>

        {/* Progress Heatmaps section */}
        {heatmapHabits.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: "#F59E0B" }} />
              <h2
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ color: "#64748B" }}
              >
                Progress Heatmaps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {heatmapHabits.map((habit) => (
                <HabitHeatmap
                  key={habit.id}
                  habitId={habit.id}
                  habitName={habit.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create dialog */}
      <HabitCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppShell>
  );
}
