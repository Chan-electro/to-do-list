import { create } from "zustand";

interface AuthStore {
  userId: string | null;
  userName: string | null;
  isLoaded: boolean;
  setUser: (userId: string, userName: string) => void;
  clearUser: () => void;
  setLoaded: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  userId: null,
  userName: null,
  isLoaded: false,

  setUser: (userId, userName) => set({ userId, userName }),
  clearUser: () => set({ userId: null, userName: null }),
  setLoaded: () => set({ isLoaded: true }),
}));
