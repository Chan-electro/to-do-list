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
          style={{ backgroundColor: "rgba(10,10,26,0.96)", backdropFilter: "blur(24px)" }}
        >
          {/* Exit button */}
          <button
            onClick={deactivate}
            className="absolute top-6 right-6 flex items-center gap-2 text-[#8888AA] hover:text-[#E8E8F0] transition-colors group"
          >
            <span className="text-xs font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Exit Focus Mode
            </span>
            <div className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors">
              <X className="w-4 h-4" />
            </div>
          </button>

          {/* Ambient badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 px-4 py-1.5 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00D4FF]">
              Focus Mode Active
            </span>
          </motion.div>

          {/* Task title */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl md:text-4xl font-mono font-bold text-center text-[#E8E8F0] max-w-2xl px-6 mb-10 leading-tight"
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
              className="mt-4 flex items-center gap-2 text-[#FF3366]"
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
          <p className="absolute bottom-6 text-[10px] font-mono text-[#8888AA]/40 tracking-widest">
            Press ESC to exit
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
