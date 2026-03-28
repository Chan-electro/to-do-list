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
    <div
      className="flex items-center justify-between py-3 border-b"
      style={{ borderColor: "rgba(75, 142, 255, 0.06)" }}
    >
      <span className="text-sm text-[#94A3B8]">{label}</span>
      <button
        onClick={onToggle}
        aria-pressed={checked}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: checked ? "#4B8EFF" : "rgba(75, 142, 255, 0.1)" }}
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
      className="glass rounded-2xl p-6 space-y-1"
      style={{
        background: "rgba(11, 21, 36, 0.75)",
        border: "1px solid rgba(75, 142, 255, 0.12)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">
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
    <div
      className="flex items-center justify-between py-3 border-b"
      style={{ borderColor: "rgba(75, 142, 255, 0.06)" }}
    >
      <span className="text-sm text-[#94A3B8]">{label}</span>
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
          className="w-16 text-center text-sm font-mono rounded-lg px-2 py-1 outline-none transition-colors"
          style={{
            background: "rgba(75, 142, 255, 0.05)",
            border: "1px solid rgba(75, 142, 255, 0.15)",
            color: "#F1F5F9",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#4B8EFF";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(75, 142, 255, 0.15)";
          }}
        />
        {unit && (
          <span className="text-xs text-[#94A3B8] w-8">{unit}</span>
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
          <h1 className="text-2xl md:text-3xl font-mono font-bold text-[#F1F5F9]">
            Settings
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">Configure your command center</p>
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
                style={{
                  background: "rgba(75, 142, 255, 0.03)",
                  border: "1px solid rgba(75, 142, 255, 0.1)",
                }}
              >
                <span className="text-[#94A3B8]">Database</span>
                <p className="text-[#F1F5F9] mt-1">SQLite (Local)</p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{
                  background: "rgba(75, 142, 255, 0.03)",
                  border: "1px solid rgba(75, 142, 255, 0.1)",
                }}
              >
                <span className="text-[#94A3B8]">Backup</span>
                <p className="text-[#F1F5F9] mt-1">Nightly cron</p>
              </div>
            </div>
            <DataExportPanel />
            <a
              href="/api/backup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono transition-colors text-[#4B8EFF] hover:text-[#93C5FD]"
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
              <span className="text-[#94A3B8]">Application</span>
              <span className="text-[#4B6080]">Nexus Command Center</span>
            </div>
            <div
              className="flex items-baseline justify-between border-b pb-3"
              style={{ borderColor: "rgba(75, 142, 255, 0.06)" }}
            >
              <span className="text-[#94A3B8]">Version</span>
              <span className="text-[#4B6080]">1.0.0</span>
            </div>
            <div
              className="flex items-baseline justify-between border-b pb-3"
              style={{ borderColor: "rgba(75, 142, 255, 0.06)" }}
            >
              <span className="text-[#94A3B8]">Built for</span>
              <span className="text-[#4B6080]">Chandan B Krishna</span>
            </div>
            <div
              className="flex items-baseline justify-between border-b pb-3"
              style={{ borderColor: "rgba(75, 142, 255, 0.06)" }}
            >
              <span className="text-[#94A3B8]">Framework</span>
              <span className="text-[#4B6080]">Next.js + tRPC</span>
            </div>
            <div
              className="flex items-baseline justify-between border-b pb-3"
              style={{ borderColor: "rgba(75, 142, 255, 0.06)" }}
            >
              <span className="text-[#94A3B8]">State</span>
              <span className="text-[#4B6080]">Zustand + React Query</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[#94A3B8]">Database</span>
              <span className="text-[#4B6080]">Drizzle ORM + SQLite</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
