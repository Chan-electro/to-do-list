"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Check, Dumbbell, BookOpen, Brain, Droplets, Phone, Heart, Star, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const ICON_MAP: Record<string, React.ReactNode> = {
  dumbbell: <Dumbbell className="w-5 h-5" />,
  "book-open": <BookOpen className="w-5 h-5" />,
  brain: <Brain className="w-5 h-5" />,
  droplets: <Droplets className="w-5 h-5" />,
  phone: <Phone className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
};

function getIconNode(icon: string | null | undefined): React.ReactNode {
  if (!icon) return <Star className="w-5 h-5" />;
  return ICON_MAP[icon] ?? <Star className="w-5 h-5" />;
}

export function HabitCheckIn() {
  const utils = trpc.useUtils();
  const today = new Date().toISOString().slice(0, 10);

  const { data: habits, isLoading } = trpc.habit.list.useQuery();

  const toggleLog = trpc.habit.toggleLog.useMutation({
    onMutate: async ({ habitId }) => {
      await utils.habit.list.cancel();
      const prev = utils.habit.list.getData();
      utils.habit.list.setData(undefined, (old) =>
        old?.map((h) =>
          h.id === habitId
            ? { ...h, completedToday: !h.completedToday }
            : h
        ) ?? old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.habit.list.setData(undefined, ctx.prev);
    },
    onSettled: () => {
      utils.habit.list.invalidate();
      utils.habit.getStreaks.invalidate();
    },
  });

  const [animating, setAnimating] = useState<Set<string>>(new Set());

  function handleToggle(habitId: string) {
    setAnimating((prev) => new Set(prev).add(habitId));
    setTimeout(() => {
      setAnimating((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }, 400);
    toggleLog.mutate({ habitId, date: today });
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl animate-pulse"
            style={{ background: "#0F1D30" }}
          />
        ))}
      </div>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
        style={{
          background: "rgba(11,21,36,0.75)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(75,142,255,0.1)",
        }}
      >
        <Flame className="w-10 h-10 mb-3" style={{ color: "rgba(75,142,255,0.3)" }} />
        <p className="font-mono text-base text-[#94A3B8]">
          No habits yet. Add your first habit!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {habits.map((habit) => {
        const done = habit.completedToday;
        const isAnimating = animating.has(habit.id);
        const streak = habit.streakCurrent ?? 0;
        const streakColor = streak >= 7 ? "#34D399" : "#FCD34D";

        return (
          <motion.button
            key={habit.id}
            onClick={() => handleToggle(habit.id)}
            animate={
              isAnimating
                ? { scale: [1, 1.08, 0.96, 1.02, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative rounded-2xl p-4 text-left cursor-pointer select-none transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8EFF]"
            style={{
              background: done
                ? "rgba(52,211,153,0.05)"
                : "#0F1D30",
              border: done
                ? "1px solid rgba(52,211,153,0.3)"
                : "1px solid rgba(75,142,255,0.1)",
              transform: done ? "translateY(-1px)" : undefined,
            }}
          >
            {/* Done checkmark badge */}
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute top-2 right-2 rounded-full flex items-center justify-center w-5 h-5"
                  style={{ background: "#34D399" }}
                >
                  <Check className="w-3 h-3" style={{ color: "#060B14" }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{
                background: "rgba(75,142,255,0.1)",
                color: done ? "#34D399" : "#4B8EFF",
              }}
            >
              {getIconNode(habit.icon)}
            </div>

            {/* Name */}
            <p className="font-mono text-sm font-medium leading-tight mb-2 pr-5 text-[#F1F5F9]">
              {habit.name}
            </p>

            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1">
                <Flame
                  className="w-3.5 h-3.5"
                  style={{ color: streakColor }}
                />
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: streakColor }}
                >
                  {streak}
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
