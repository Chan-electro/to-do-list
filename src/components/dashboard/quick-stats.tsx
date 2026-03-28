"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Flame, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const stats = [
  {
    key: "tasksCompleted",
    label: "Tasks Done",
    icon: CheckCircle2,
    color: "#10B981",
    bg: "#D1FAE5",
    getValue: (data: DashboardData | undefined) =>
      String(data?.tasks.completedToday ?? 0),
  },
  {
    key: "focusTime",
    label: "Focus Time",
    icon: Clock,
    color: "#2563EB",
    bg: "#DBEAFE",
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
    color: "#F59E0B",
    bg: "#FEF3C7",
    getValue: (data: DashboardData | undefined) =>
      `${data?.habits.completed ?? 0}/${data?.habits.total ?? 0}`,
  },
  {
    key: "streak",
    label: "Best Streak",
    icon: Zap,
    color: "#7C3AED",
    bg: "#EDE9FE",
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
              className="flex flex-col items-center text-center rounded-xl p-3 transition-colors duration-200"
              style={{ background: "rgba(15, 23, 42, 0.02)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = stat.bg + "50";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(15, 23, 42, 0.02)";
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ background: stat.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              {isLoading ? (
                <div className="h-7 w-12 rounded skeleton" />
              ) : (
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: "#0F172A",
                    fontFamily: "var(--font-jetbrains), monospace",
                  }}
                >
                  {stat.getValue(data as DashboardData | undefined)}
                </span>
              )}
              <span
                className="text-xs mt-1"
                style={{ color: "#64748B", fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                {stat.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
