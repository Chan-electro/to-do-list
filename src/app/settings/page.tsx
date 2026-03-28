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
      style={{ borderColor: "rgba(15, 23, 42, 0.06)" }}
    >
      <span
        className="text-sm"
        style={{ color: "#475569", fontFamily: "var(--font-dm-sans), sans-serif" }}
      >
        {label}
      </span>
      <button
        onClick={onToggle}
        aria-pressed={checked}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: checked ? "#2563EB" : "rgba(15, 23, 42, 0.1)" }}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
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
    <div className="glass rounded-2xl p-6 space-y-1">
      <h2
        className="text-lg font-semibold mb-4"
        style={{
          color: "#0F172A",
          fontFamily: "var(--font-playfair), serif",
        }}
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
    <div
      className="flex items-center justify-between py-3 border-b"
      style={{ borderColor: "rgba(15, 23, 42, 0.06)" }}
    >
      <span
        className="text-sm"
        style={{ color: "#475569", fontFamily: "var(--font-dm-sans), sans-serif" }}
      >
        {label}
      </span>
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
          className="w-16 text-center text-sm rounded-lg px-2 py-1 outline-none transition-all"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            color: "#0F172A",
            fontFamily: "var(--font-jetbrains), monospace",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#2563EB";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(15,23,42,0.12)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {unit && (
          <span
            className="text-xs w-8"
            style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            {unit}
          </span>
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
      <div className="space-y-6 max-w-2xl page-enter">
        {/* Header */}
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Configure your command center
          </p>
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
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className="rounded-xl p-3"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(15, 23, 42, 0.07)",
                }}
              >
                <span style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  Database
                </span>
                <p
                  className="mt-1 font-medium"
                  style={{ color: "#0F172A", fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  SQLite (Local)
                </p>
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(15, 23, 42, 0.07)",
                }}
              >
                <span style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  Backup
                </span>
                <p
                  className="mt-1 font-medium"
                  style={{ color: "#0F172A", fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  Nightly cron
                </p>
              </div>
            </div>
            <DataExportPanel />
            <a
              href="/api/backup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs transition-colors hover:underline"
              style={{ color: "#2563EB", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              /api/backup endpoint
              <span style={{ opacity: 0.6 }}>→</span>
            </a>
          </div>
        </SectionCard>

        {/* 5. About */}
        <SectionCard title="About">
          <div className="py-2 space-y-3 text-sm">
            {[
              { label: "Application", value: "Nexus Command Center" },
              { label: "Version", value: "1.0.0" },
              { label: "Built for", value: "Chandan B Krishna" },
              { label: "Framework", value: "Next.js + tRPC" },
              { label: "State", value: "Zustand + React Query" },
              { label: "Database", value: "Drizzle ORM + SQLite" },
            ].map(({ label, value }, i, arr) => (
              <div
                key={label}
                className="flex items-baseline justify-between pb-3"
                style={{
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(15,23,42,0.06)" : "none",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                <span style={{ color: "#94A3B8" }}>{label}</span>
                <span style={{ color: "#475569", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
