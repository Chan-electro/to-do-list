import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  // Timer settings
  pomodoroDuration: number;   // minutes, default 25
  breakDuration: number;       // minutes, default 5
  longBreakDuration: number;   // minutes, default 15
  autoStartBreaks: boolean;

  // Appearance
  reducedMotion: boolean;
  compactMode: boolean;

  // Notifications
  desktopNotifications: boolean;
  soundEnabled: boolean;

  // Actions
  updateSetting: <K extends keyof Omit<SettingsStore, "updateSetting">>(
    key: K,
    value: SettingsStore[K]
  ) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      pomodoroDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: false,
      reducedMotion: false,
      compactMode: false,
      desktopNotifications: true,
      soundEnabled: false,
      updateSetting: (key, value) => set({ [key]: value } as Partial<SettingsStore>),
    }),
    { name: "nexus-settings" }
  )
);
