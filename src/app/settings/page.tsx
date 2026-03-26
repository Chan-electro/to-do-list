"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#8888AA] to-[#E8E8F0] bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className="text-sm text-[#8888AA] mt-1">
            Configure your command center
          </p>
        </div>

        <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Settings className="w-12 h-12 text-[#8888AA]/30 mb-4" />
          <p className="text-lg font-mono text-[#8888AA]">
            Settings coming soon
          </p>
          <p className="text-sm text-[#8888AA]/60 mt-1">
            Theme, timezone, Pomodoro durations, and more
          </p>
        </div>
      </div>
    </AppShell>
  );
}
