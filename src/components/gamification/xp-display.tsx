"use client";

import { motion } from "framer-motion";
import { useGamificationStore } from "@/stores/gamification-store";

export function XpDisplay() {
  const { totalXp, getRank, getNextRank, getProgressToNext } =
    useGamificationStore();

  const rank = getRank();
  const nextRank = getNextRank();
  const progress = getProgressToNext();

  return (
    <div className="px-3 py-2 rounded-lg bg-[rgba(26,26,62,0.6)] backdrop-blur-xl border border-white/[0.06]">
      {/* Rank row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{rank.icon}</span>
          <span
            className="text-xs font-mono font-semibold uppercase tracking-wider"
            style={{ color: rank.color }}
          >
            {rank.name}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#8888AA]">
          {totalXp.toLocaleString()} XP
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: rank.color,
            boxShadow: `0 0 8px ${rank.color}80`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Next rank label */}
      {nextRank ? (
        <p className="text-[9px] font-mono text-[#8888AA] mt-1 text-right">
          {nextRank.minXp - totalXp} XP to {nextRank.name}
        </p>
      ) : (
        <p className="text-[9px] font-mono mt-1 text-right" style={{ color: rank.color }}>
          Max rank achieved
        </p>
      )}
    </div>
  );
}
