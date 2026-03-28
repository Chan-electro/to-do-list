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
            Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
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
