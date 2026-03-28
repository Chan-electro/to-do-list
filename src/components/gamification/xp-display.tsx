"use client";

import { motion } from "framer-motion";
import { useGamificationStore } from "@/stores/gamification-store";

const RANK_COLOR_MAP: Record<string, string> = {
  Rookie: "#94A3B8",
  Operator: "#60A5FA",
  Commander: "#A78BFA",
  Architect: "#FCD34D",
  Legend: "#FB7185",
};

export function XpDisplay() {
  const { totalXp, getRank, getNextRank, getProgressToNext } =
    useGamificationStore();

  const rank = getRank();
  const nextRank = getNextRank();
  const progress = getProgressToNext();

  const rankColor = RANK_COLOR_MAP[rank.name] ?? rank.color;

  return (
    <div
      className="px-3 py-2 rounded-xl"
      style={{
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Rank row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{rank.icon}</span>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: rankColor, fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            {rank.name}
          </span>
        </div>
        <span
          className="text-[10px]"
          style={{ color: "rgba(241,245,249,0.5)", fontFamily: "var(--font-jetbrains), monospace" }}
        >
          {totalXp.toLocaleString()} XP
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255, 255, 255, 0.1)" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: rankColor }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Next rank label */}
      {nextRank ? (
        <p
          className="text-[9px] mt-1 text-right"
          style={{ color: "rgba(241,245,249,0.4)" }}
        >
          {nextRank.minXp - totalXp} XP to {nextRank.name}
        </p>
      ) : (
        <p className="text-[9px] mt-1 text-right" style={{ color: rankColor }}>
          Max rank achieved
        </p>
      )}
    </div>
  );
}
