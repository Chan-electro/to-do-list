"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useSettings } from "@/stores/settings-store";
import { useTimerStore } from "@/stores/timer-store";
import { DataExportPanel } from "@/components/settings/data-export-panel";

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
      <span className="text-sm text-[#E8E8F0]">{label}</span>
      <button
        onClick={onToggle}
        aria-pressed={checked}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-[#00D4FF]" : "bg-white/[0.1]"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-6 space-y-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <h2
        className="text-xs font-mono uppercase tracking-[0.18em] mb-4"
        style={{ color: "#00D4FF" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function NumericInput({
  label,
  value,
  min,
  max,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
      <span className="text-sm text-[#E8E8F0]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          className="w-16 text-center text-sm font-mono rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-[#00D4FF]/50"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#E8E8F0",
          }}
        />
        {unit && (
          <span className="text-xs text-[#8888AA] w-8">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const settings = useSettings();
  const timerStore = useTimerStore();
  const { updateSetting } = settings;

  const handlePomodoro = (minutes: number) => {
    updateSetting("pomodoroDuration", minutes);
    timerStore.setTargetSeconds(minutes * 60);
  };

  const handleBreak = (minutes: number) => {
    updateSetting("breakDuration", minutes);
  };

  const handleLongBreak = (minutes: number) => {
    updateSetting("longBreakDuration", minutes);
  };

  const requestNotificationPermission = async (enable: boolean) => {
    if (enable && "Notification" in window) {
      const permission = await Notification.requestPermission();
      updateSetting("desktopNotifications", permission === "granted");
    } else {
      updateSetting("desktopNotifications", false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#8888AA] to-[#E8E8F0] bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className="text-sm text-[#8888AA] mt-1">Configure your command center</p>
        </div>

        {/* 1. Timer Settings */}
        <SectionCard title="Timer Settings">
          <NumericInput
            label="Pomodoro Duration"
            value={settings.pomodoroDuration}
            min={1}
            max={120}
            unit="min"
            onChange={handlePomodoro}
          />
          <NumericInput
            label="Break Duration"
            value={settings.breakDuration}
            min={1}
            max={60}
            unit="min"
            onChange={handleBreak}
          />
          <NumericInput
            label="Long Break Duration"
            value={settings.longBreakDuration}
            min={1}
            max={60}
            unit="min"
            onChange={handleLongBreak}
          />
          <Toggle
            label="Auto-start breaks"
            checked={settings.autoStartBreaks}
            onToggle={() => updateSetting("autoStartBreaks", !settings.autoStartBreaks)}
          />
        </SectionCard>

        {/* 2. Appearance */}
        <SectionCard title="Appearance">
          <Toggle
            label="Reduced motion"
            checked={settings.reducedMotion}
            onToggle={() => updateSetting("reducedMotion", !settings.reducedMotion)}
          />
          <Toggle
            label="Compact mode"
            checked={settings.compactMode}
            onToggle={() => updateSetting("compactMode", !settings.compactMode)}
          />
        </SectionCard>

        {/* 3. Notifications */}
        <SectionCard title="Notifications">
          <Toggle
            label="Desktop notifications"
            checked={settings.desktopNotifications}
            onToggle={() => requestNotificationPermission(!settings.desktopNotifications)}
          />
          <Toggle
            label="Sound effects"
            checked={settings.soundEnabled}
            onToggle={() => updateSetting("soundEnabled", !settings.soundEnabled)}
          />
        </SectionCard>

        {/* 4. Data & Backup */}
        <SectionCard title="Data & Backup">
          <div className="py-2 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div
                className="rounded-lg p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-[#8888AA]">Database</span>
                <p className="text-[#E8E8F0] mt-1">SQLite (Local)</p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-[#8888AA]">Backup</span>
                <p className="text-[#E8E8F0] mt-1">Nightly cron</p>
              </div>
            </div>
            <DataExportPanel />
            <a
              href="/api/backup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono transition-colors"
              style={{ color: "#7B2FFF" }}
            >
              /api/backup endpoint
              <span className="opacity-60">→</span>
            </a>
          </div>
        </SectionCard>

        {/* 5. About */}
        <SectionCard title="About">
          <div className="py-2 space-y-3 text-sm font-mono">
            <div className="flex items-baseline justify-between">
              <span className="text-[#8888AA]">Application</span>
              <span className="text-[#E8E8F0]">Nexus Command Center</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/[0.04] pb-3">
              <span className="text-[#8888AA]">Version</span>
              <span
                className="text-[#00FF88]"
                style={{ textShadow: "0 0 8px rgba(0,255,136,0.5)" }}
              >
                1.0.0
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/[0.04] pb-3">
              <span className="text-[#8888AA]">Built for</span>
              <span className="text-[#E8E8F0]">Chandan B Krishna</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/[0.04] pb-3">
              <span className="text-[#8888AA]">Framework</span>
              <span className="text-[#E8E8F0]">Next.js + tRPC</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/[0.04] pb-3">
              <span className="text-[#8888AA]">State</span>
              <span className="text-[#E8E8F0]">Zustand + React Query</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[#8888AA]">Database</span>
              <span className="text-[#E8E8F0]">Drizzle ORM + SQLite</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
