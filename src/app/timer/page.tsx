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
      <div className="space-y-6 page-enter">
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            Time Suite
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Focus, track, and optimize your time
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center">
          <div
            className="inline-flex gap-1 rounded-xl p-1"
            style={{
              background: "#F1F5F9",
              border: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "#FFFFFF",
                          color: "#2563EB",
                          boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
                          fontFamily: "var(--font-dm-sans), sans-serif",
                        }
                      : {
                          color: "#64748B",
                          fontFamily: "var(--font-dm-sans), sans-serif",
                        }
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
        <div className="glass rounded-2xl p-8 md:p-12 flex justify-center">
          {activeTab === "pomodoro" && <PomodoroTimer />}
          {activeTab === "stopwatch" && <Stopwatch />}
          {activeTab === "countdown" && <CountdownTimer />}
        </div>
      </div>
    </AppShell>
  );
}
