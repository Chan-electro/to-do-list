"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HeroStatus } from "@/components/dashboard/hero-status";
import { TodayAgenda } from "@/components/dashboard/today-agenda";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { WeeklyHeatmap } from "@/components/dashboard/weekly-heatmap";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] bg-clip-text text-transparent">
              Mission Control
            </span>
          </h1>
          <p className="text-sm text-[#8888AA] mt-1">
            Your command center overview
          </p>
        </div>

        {/* Hero Status Bar */}
        <HeroStatus />

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
          </div>
        </div>
      </div>
    </AppShell>
  );
}
