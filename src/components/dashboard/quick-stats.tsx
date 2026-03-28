"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Flame, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const stats = [
  {
    key: "tasksCompleted",
    label: "Tasks Done",
    icon: CheckCircle2,
    color: "#34D399",
    getValue: (data: DashboardData | undefined) =>
      String(data?.tasks.completedToday ?? 0),
  },
  {
    key: "focusTime",
    label: "Focus Time",
    icon: Clock,
    color: "#4B8EFF",
    getValue: (data: DashboardData | undefined) => {
      const mins = data?.timer.focusMinutesToday ?? 0;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    },
  },
  {
    key: "habitsCompleted",
    label: "Habits",
    icon: Flame,
    color: "#FCD34D",
    getValue: (data: DashboardData | undefined) =>
      `${data?.habits.completed ?? 0}/${data?.habits.total ?? 0}`,
  },
  {
    key: "streak",
    label: "Best Streak",
    icon: Zap,
    color: "#8B5CF6",
    getValue: (data: DashboardData | undefined) =>
      `${data?.habits.bestStreak?.streak ?? 0}d`,
  },
];

type DashboardData = {
  tasks: { completedToday: number };
  timer: { focusMinutesToday: number };
  habits: {
    completed: number;
    total: number;
    bestStreak: { streak: number } | null;
  };
};

export function QuickStats() {
  const { data, isLoading } = trpc.dashboard.getSummary.useQuery();

  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center rounded-lg p-3 hover:bg-[rgba(75,142,255,0.04)] transition-colors duration-200"
            >
              <Icon
                className="w-5 h-5 mb-2"
                style={{ color: stat.color }}
              />
              {isLoading ? (
                <div className="h-8 w-12 rounded bg-white/[0.05] animate-pulse" />
              ) : (
                <span
                  className="text-2xl font-mono font-bold text-[#F1F5F9]"
                >
                  {stat.getValue(data as DashboardData | undefined)}
                </span>
              )}
              <span className="text-xs text-[#94A3B8] mt-1">{stat.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
