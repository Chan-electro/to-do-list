"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ProductivityScore } from "@/components/analytics/productivity-score";
import { TaskVelocityChart } from "@/components/analytics/task-velocity-chart";
import { DomainDistribution } from "@/components/analytics/domain-distribution";
import { FocusTimeChart } from "@/components/analytics/focus-time-chart";
import { TeamUtilization } from "@/components/analytics/team-utilization";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#4B8EFF] to-[#8B5CF6] bg-clip-text text-transparent">
              Analytics
            </span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1 font-mono">
            Your productivity nerve center
          </p>
        </div>

        {/* Top Row: Productivity Score (1/3) + Task Velocity (2/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <ProductivityScore />
          </div>
          <div className="md:col-span-2">
            <TaskVelocityChart />
          </div>
        </div>

        {/* Middle Row: Domain Distribution (1/2) + Focus Time (1/2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DomainDistribution />
          <FocusTimeChart />
        </div>

        {/* Bottom Row: Team Utilization full width */}
        <TeamUtilization />
      </div>
    </AppShell>
  );
}
