"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#00FF88] bg-clip-text text-transparent">
              Analytics
            </span>
          </h1>
          <p className="text-sm text-[#8888AA] mt-1">
            Your data nerve center
          </p>
        </div>

        <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-[#00D4FF]/30 mb-4" />
          <p className="text-lg font-mono text-[#8888AA]">
            Analytics Dashboard coming in Phase 2
          </p>
          <p className="text-sm text-[#8888AA]/60 mt-1">
            Productivity scores, charts, and reports
          </p>
        </div>
      </div>
    </AppShell>
  );
}
