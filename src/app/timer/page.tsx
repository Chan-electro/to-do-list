"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { Stopwatch } from "@/components/timer/stopwatch";
import { CountdownTimer } from "@/components/timer/countdown-timer";
import { Timer, Clock, Hourglass } from "lucide-react";

type TimerTab = "pomodoro" | "stopwatch" | "countdown";

const TABS: { id: TimerTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "pomodoro", label: "Pomodoro", icon: Timer, color: "#00D4FF" },
  { id: "stopwatch", label: "Stopwatch", icon: Clock, color: "#FFB800" },
  { id: "countdown", label: "Countdown", icon: Hourglass, color: "#7B2FFF" },
];

export default function TimerPage() {
  const [activeTab, setActiveTab] = useState<TimerTab>("pomodoro");

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] bg-clip-text text-transparent">
              Time Suite
            </span>
          </h1>
          <p className="text-sm text-[#8888AA] mt-1">
            Focus, track, and optimize your time
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center">
          <div className="glass rounded-xl p-1 inline-flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
                    isActive
                      ? "bg-white/[0.08]"
                      : "text-[#8888AA] hover:text-[#E8E8F0]"
                  }`}
                  style={isActive ? { color: tab.color } : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer Content */}
        <div className="glass rounded-xl p-8 md:p-12 flex justify-center">
          {activeTab === "pomodoro" && <PomodoroTimer />}
          {activeTab === "stopwatch" && <Stopwatch />}
          {activeTab === "countdown" && <CountdownTimer />}
        </div>
      </div>
    </AppShell>
  );
}
