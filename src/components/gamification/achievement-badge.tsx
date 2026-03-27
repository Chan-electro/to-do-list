"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementBadgeProps {
  code: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export function AchievementBadge({
  name,
  description,
  icon,
  unlocked,
  unlockedAt,
}: AchievementBadgeProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div
        className="relative w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 cursor-default select-none overflow-hidden border"
        style={
          unlocked
            ? {
                background: "rgba(26,26,62,0.6)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(0,212,255,0.25)",
                boxShadow: "0 0 16px rgba(0,212,255,0.15)",
              }
            : {
                background: "rgba(10,10,26,0.5)",
                backdropFilter: "blur(8px)",
                borderColor: "rgba(255,255,255,0.04)",
              }
        }
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.15 }}
      >
        {/* Icon */}
        <span
          className="text-2xl leading-none"
          style={{ filter: unlocked ? "none" : "grayscale(1) opacity(0.3)" }}
        >
          {icon}
        </span>

        {/* Name */}
        <span
          className="text-[9px] font-mono text-center px-1 leading-tight"
          style={{ color: unlocked ? "#E8E8F0" : "#8888AA", opacity: unlocked ? 1 : 0.4 }}
        >
          {name}
        </span>

        {/* Lock overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A1A]/40 rounded-xl">
            <Lock className="w-4 h-4 text-[#8888AA] opacity-60" />
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-44 pointer-events-none"
          >
            <div className="rounded-lg border border-white/[0.08] bg-[#12122A] px-3 py-2 text-center shadow-xl">
              <p className="text-xs font-semibold text-[#E8E8F0] mb-0.5">{name}</p>
              <p className="text-[10px] text-[#8888AA] leading-snug">{description}</p>
              {unlocked && unlockedAt && (
                <p className="text-[9px] text-[#00FF88] mt-1">
                  Unlocked {unlockedAt.split("T")[0]}
                </p>
              )}
              {!unlocked && (
                <p className="text-[9px] text-[#8888AA]/60 mt-1">Locked</p>
              )}
            </div>
            {/* Arrow */}
            <div className="w-2 h-2 bg-[#12122A] border-b border-r border-white/[0.08] rotate-45 mx-auto -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
