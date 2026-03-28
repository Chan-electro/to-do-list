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
                background: "rgba(75, 142, 255, 0.08)",
                borderColor: "rgba(75, 142, 255, 0.2)",
                boxShadow: "0 0 20px rgba(75, 142, 255, 0.15)",
              }
            : {
                background: "rgba(75, 142, 255, 0.03)",
                borderColor: "rgba(75, 142, 255, 0.06)",
              }
        }
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
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
          style={{ color: unlocked ? "#F1F5F9" : "#4B6080" }}
        >
          {name}
        </span>

        {/* Lock overlay */}
        {!unlocked && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(6, 11, 20, 0.4)" }}
          >
            <Lock className="w-4 h-4 text-[#4B6080] opacity-60" />
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
            <div
              className="rounded-lg px-3 py-2 text-center shadow-xl"
              style={{
                background: "#0F1D30",
                border: "1px solid rgba(75, 142, 255, 0.15)",
              }}
            >
              <p className="text-xs font-semibold text-[#F1F5F9] mb-0.5">{name}</p>
              <p className="text-[10px] text-[#94A3B8] leading-snug">{description}</p>
              {unlocked && unlockedAt && (
                <p className="text-[9px] text-[#34D399] mt-1">
                  Unlocked {unlockedAt.split("T")[0]}
                </p>
              )}
              {!unlocked && (
                <p className="text-[9px] text-[#4B6080] mt-1">Locked</p>
              )}
            </div>
            {/* Arrow */}
            <div
              className="w-2 h-2 rotate-45 mx-auto -mt-1"
              style={{
                background: "#0F1D30",
                borderBottom: "1px solid rgba(75, 142, 255, 0.15)",
                borderRight: "1px solid rgba(75, 142, 255, 0.15)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
