"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HeroStatus } from "@/components/dashboard/hero-status";
import { TodayAgenda } from "@/components/dashboard/today-agenda";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { WeeklyHeatmap } from "@/components/dashboard/weekly-heatmap";
import { NLQuickAdd } from "@/components/tasks/nl-quick-add";
import { AchievementsGrid } from "@/components/gamification/achievements-grid";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 page-enter">
        {/* Page Header */}
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            Mission Control
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B", fontFamily: "var(--font-dm-sans), sans-serif" }}>
            Your command center overview
          </p>
        </div>

        {/* Hero Status Bar */}
        <HeroStatus />

        {/* NL Quick Add */}
        <NLQuickAdd />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <TodayAgenda />
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            <QuickStats />
            <WeeklyHeatmap />
            <div className="glass rounded-2xl p-5">
              <h2
                className="text-base font-semibold mb-4"
                style={{ color: "#0F172A", fontFamily: "var(--font-playfair), serif" }}
              >
                Achievements
              </h2>
              <AchievementsGrid />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
