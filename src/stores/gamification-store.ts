import { create } from "zustand";
import { persist } from "zustand/middleware";

const RANKS = [
  { name: "Rookie", minXp: 0, color: "#8888AA", icon: "👾" },
  { name: "Operator", minXp: 500, color: "#00D4FF", icon: "🔧" },
  { name: "Commander", minXp: 2000, color: "#7B2FFF", icon: "⚡" },
  { name: "Architect", minXp: 5000, color: "#FFB800", icon: "🏗️" },
  { name: "Legend", minXp: 10000, color: "#FF3366", icon: "🌟" },
];

interface GamificationStore {
  totalXp: number;
  addXp: (amount: number) => void;
  getRank: () => (typeof RANKS)[0];
  getNextRank: () => (typeof RANKS)[0] | null;
  getProgressToNext: () => number;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      totalXp: 0,

      addXp: (amount: number) => {
        set((state) => ({ totalXp: state.totalXp + amount }));
      },

      getRank: () => {
        const { totalXp } = get();
        let current = RANKS[0]!;
        for (const rank of RANKS) {
          if (totalXp >= rank.minXp) {
            current = rank;
          }
        }
        return current;
      },

      getNextRank: () => {
        const { totalXp } = get();
        for (const rank of RANKS) {
          if (totalXp < rank.minXp) {
            return rank;
          }
        }
        return null;
      },

      getProgressToNext: () => {
        const { totalXp, getRank, getNextRank } = get();
        const current = getRank();
        const next = getNextRank();
        if (!next) return 100;
        const range = next.minXp - current.minXp;
        const progress = totalXp - current.minXp;
        return Math.min(100, Math.round((progress / range) * 100));
      },
    }),
    {
      name: "nexus-gamification",
    }
  )
);

export { RANKS };
