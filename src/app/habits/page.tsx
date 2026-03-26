"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Flame } from "lucide-react";

export default function HabitsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#FFB800] to-[#FF3366] bg-clip-text text-transparent">
              Habits
            </span>
          </h1>
          <p className="text-sm text-[#8888AA] mt-1">
            Track your daily disciplines
          </p>
        </div>

        <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Flame className="w-12 h-12 text-[#FFB800]/30 mb-4" />
          <p className="text-lg font-mono text-[#8888AA]">
            Habit Tracker coming in Phase 2
          </p>
          <p className="text-sm text-[#8888AA]/60 mt-1">
            Daily check-ins, streaks, and heatmaps
          </p>
        </div>
      </div>
    </AppShell>
  );
}
