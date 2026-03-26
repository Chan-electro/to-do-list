import { create } from "zustand";

type TimerMode = "pomodoro" | "stopwatch" | "countdown";
type TimerState = "idle" | "running" | "paused";

interface TimerStore {
  mode: TimerMode;
  state: TimerState;
  seconds: number;
  targetSeconds: number;
  linkedTaskId: string | null;
  distractions: number;
  pomodoroCount: number;

  // Pomodoro settings
  workDuration: number;     // seconds
  breakDuration: number;    // seconds
  longBreakDuration: number;
  isBreak: boolean;

  // Actions
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  linkTask: (taskId: string | null) => void;
  logDistraction: () => void;
  setTargetSeconds: (secs: number) => void;
  completePomodoroSession: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  mode: "pomodoro",
  state: "idle",
  seconds: 0,
  targetSeconds: 25 * 60, // 25 min default
  linkedTaskId: null,
  distractions: 0,
  pomodoroCount: 0,

  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  isBreak: false,

  setMode: (mode) => {
    const store = get();
    let target = store.workDuration;
    if (mode === "countdown") target = 5 * 60;
    if (mode === "stopwatch") target = 0;
    set({ mode, state: "idle", seconds: 0, targetSeconds: target, isBreak: false });
  },

  start: () => set({ state: "running" }),
  pause: () => set({ state: "paused" }),

  reset: () => {
    const store = get();
    set({
      state: "idle",
      seconds: 0,
      distractions: 0,
      targetSeconds:
        store.mode === "pomodoro" ? store.workDuration : store.targetSeconds,
      isBreak: false,
    });
  },

  tick: () => {
    const store = get();
    if (store.state !== "running") return;
    set({ seconds: store.seconds + 1 });
  },

  linkTask: (taskId) => set({ linkedTaskId: taskId }),
  logDistraction: () => set({ distractions: get().distractions + 1 }),
  setTargetSeconds: (secs) => set({ targetSeconds: secs }),

  completePomodoroSession: () => {
    const store = get();
    const newCount = store.pomodoroCount + 1;
    const isLongBreak = newCount % 4 === 0;
    set({
      pomodoroCount: newCount,
      state: "idle",
      seconds: 0,
      isBreak: true,
      targetSeconds: isLongBreak ? store.longBreakDuration : store.breakDuration,
    });
  },
}));
