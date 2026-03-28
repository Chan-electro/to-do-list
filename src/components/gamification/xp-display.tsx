"use client";

import { motion } from "framer-motion";
import { useGamificationStore } from "@/stores/gamification-store";

// Softened rank colors for the Soft Mood theme
const RANK_COLOR_MAP: Record<string, string> = {
  Rookie: "#94A3B8",
  Operator: "#4B8EFF",
  Commander: "#8B5CF6",
  Architect: "#FCD34D",
  Legend: "#F87171",
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
        background: "rgba(75, 142, 255, 0.05)",
        border: "1px solid rgba(75, 142, 255, 0.1)",
      }}
    >
      {/* Rank row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{rank.icon}</span>
          <span
            className="text-xs font-mono font-semibold uppercase tracking-wider"
            style={{ color: rankColor }}
          >
            {rank.name}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#94A3B8]">
          {totalXp.toLocaleString()} XP
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(75, 142, 255, 0.12)" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[#4B8EFF]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Next rank label */}
      {nextRank ? (
        <p className="text-[9px] font-mono text-[#94A3B8] mt-1 text-right">
          {nextRank.minXp - totalXp} XP to {nextRank.name}
        </p>
      ) : (
        <p className="text-[9px] font-mono mt-1 text-right" style={{ color: rankColor }}>
          Max rank achieved
        </p>
      )}
    </div>
  );
}
