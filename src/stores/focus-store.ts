import { create } from "zustand";

interface FocusStore {
  isActive: boolean;
  taskId: string | null;
  taskTitle: string;
  activateFor: (taskId: string, taskTitle: string) => void;
  deactivate: () => void;
}

export const useFocusStore = create<FocusStore>((set) => ({
  isActive: false,
  taskId: null,
  taskTitle: "",

  activateFor: (taskId: string, taskTitle: string) => {
    set({ isActive: true, taskId, taskTitle });
  },

  deactivate: () => {
    set({ isActive: false, taskId: null, taskTitle: "" });
  },
}));
