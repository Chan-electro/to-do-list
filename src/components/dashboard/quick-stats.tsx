"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Flame, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const stats = [
  {
    key: "tasksCompleted",
    label: "Tasks Done",
    icon: CheckCircle2,
    color: "#00FF88",
    getValue: (data: DashboardData | undefined) =>
      String(data?.tasks.completedToday ?? 0),
  },
  {
    key: "focusTime",
    label: "Focus Time",
    icon: Clock,
    color: "#00D4FF",
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
    color: "#FFB800",
    getValue: (data: DashboardData | undefined) =>
      `${data?.habits.completed ?? 0}/${data?.habits.total ?? 0}`,
  },
  {
    key: "streak",
    label: "Best Streak",
    icon: Zap,
    color: "#7B2FFF",
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
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-4 flex flex-col items-center text-center"
          >
            <Icon
              className="w-5 h-5 mb-2"
              style={{ color: stat.color }}
            />
            {isLoading ? (
              <div className="h-8 w-12 rounded bg-white/[0.05] animate-pulse" />
            ) : (
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: stat.color }}
              >
                {stat.getValue(data as DashboardData | undefined)}
              </span>
            )}
            <span className="text-xs text-[#8888AA] mt-1">{stat.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
