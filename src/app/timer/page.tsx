"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { Stopwatch } from "@/components/timer/stopwatch";
import { CountdownTimer } from "@/components/timer/countdown-timer";
import { Timer, Clock, Hourglass } from "lucide-react";

type TimerTab = "pomodoro" | "stopwatch" | "countdown";

const TABS: { id: TimerTab; label: string; icon: React.ElementType }[] = [
  { id: "pomodoro", label: "Pomodoro", icon: Timer },
  { id: "stopwatch", label: "Stopwatch", icon: Clock },
  { id: "countdown", label: "Countdown", icon: Hourglass },
];

export default function TimerPage() {
  const [activeTab, setActiveTab] = useState<TimerTab>("pomodoro");

  return (
    <AppShell>
      <div className="space-y-6" style={{ backgroundColor: "#060B14" }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#4B8EFF] to-[#8B5CF6] bg-clip-text text-transparent">
              Time Suite
            </span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Focus, track, and optimize your time
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center">
          <div
            className="glass rounded-xl p-1 inline-flex gap-1"
            style={{ border: "1px solid rgba(75,142,255,0.12)" }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "rgba(75,142,255,0.12)",
                          color: "#4B8EFF",
                        }
                      : { color: "#94A3B8" }
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer Content */}
        <div
          className="glass rounded-2xl p-8 md:p-12 flex justify-center"
          style={{ border: "1px solid rgba(75,142,255,0.12)" }}
        >
          {activeTab === "pomodoro" && <PomodoroTimer />}
          {activeTab === "stopwatch" && <Stopwatch />}
          {activeTab === "countdown" && <CountdownTimer />}
        </div>
      </div>
    </AppShell>
  );
}
