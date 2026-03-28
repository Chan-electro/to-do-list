"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { useTimerStore } from "@/stores/timer-store";
import { useFocusStore } from "@/stores/focus-store";
import { AmbientPlayer } from "@/components/focus-mode/ambient-player";

interface FocusOverlayProps {
  taskTitle: string;
  taskId: string;
}

export function FocusOverlay({ taskTitle, taskId }: FocusOverlayProps) {
  const { isActive, deactivate } = useFocusStore();
  const { distractions } = useTimerStore();

  // Escape key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        deactivate();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, deactivate]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="focus-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: "rgba(6, 11, 20, 0.97)", backdropFilter: "blur(24px)" }}
        >
          {/* Exit button */}
          <button
            onClick={deactivate}
            className="absolute top-6 right-6 flex items-center gap-2 transition-colors group"
            style={{ color: "#94A3B8" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F1F5F9")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            <span className="text-xs font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Exit Focus Mode
            </span>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{
                border: "1px solid rgba(75, 142, 255, 0.12)",
                background: "rgba(75, 142, 255, 0.04)",
              }}
            >
              <X className="w-4 h-4" />
            </div>
          </button>

          {/* Ambient badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 px-4 py-1.5 rounded-full"
            style={{
              border: "1px solid rgba(75, 142, 255, 0.2)",
              background: "rgba(75, 142, 255, 0.05)",
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4B8EFF]">
              Focus Mode Active
            </span>
          </motion.div>

          {/* Task title */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl md:text-4xl font-semibold text-center max-w-2xl px-6 mb-10 leading-tight"
            style={{ color: "#F1F5F9" }}
          >
            {taskTitle}
          </motion.h1>

          {/* Pomodoro timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PomodoroTimer />
          </motion.div>

          {/* Distraction counter */}
          {distractions > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2"
              style={{ color: "#F87171" }}
            >
              <span className="text-sm font-mono">
                {distractions} distraction{distractions !== 1 ? "s" : ""} logged
              </span>
            </motion.div>
          )}

          {/* Ambient sound selector */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <AmbientPlayer />
          </motion.div>

          {/* Keyboard hint */}
          <p className="absolute bottom-6 text-[10px] font-mono text-[#4B6080] tracking-widest">
            Press ESC to exit
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
