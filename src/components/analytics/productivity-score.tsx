"use client";

import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { CheckSquare, Clock, Flame, Zap } from "lucide-react";

export function ProductivityScore() {
  const { data: summary, isLoading } = trpc.dashboard.getSummary.useQuery();

  const tasksCompleted = summary?.tasks?.completedToday ?? 0;
  const focusMinutes = summary?.timer?.focusMinutesToday ?? 0;
  const habitsCompleted = summary?.habits?.completed ?? 0;
  const habitsTotal = summary?.habits?.total ?? 1;
  const bestStreak = summary?.habits?.bestStreak?.streak ?? 0;

  const taskScore = Math.min((tasksCompleted / 10) * 100, 100);
  const focusScore = Math.min((focusMinutes / 120) * 100, 100);
  const habitScore = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0;
  const score = Math.round(taskScore * 0.4 + focusScore * 0.3 + habitScore * 0.3);

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80 ? "#10B981" : score >= 50 ? "#2563EB" : score >= 30 ? "#F59E0B" : "#EF4444";

  const statRows = [
    {
      icon: <CheckSquare className="w-4 h-4" style={{ color: "#2563EB" }} />,
      label: "Tasks Completed",
      value: tasksCompleted,
      unit: "today",
      bg: "#DBEAFE",
    },
    {
      icon: <Clock className="w-4 h-4" style={{ color: "#7C3AED" }} />,
      label: "Focus Time",
      value: focusMinutes,
      unit: "min",
      bg: "#EDE9FE",
    },
    {
      icon: <Zap className="w-4 h-4" style={{ color: "#10B981" }} />,
      label: "Habits Done",
      value: `${habitsCompleted}/${habitsTotal}`,
      unit: "",
      bg: "#D1FAE5",
    },
    {
      icon: <Flame className="w-4 h-4" style={{ color: "#F59E0B" }} />,
      label: "Best Streak",
      value: bestStreak,
      unit: "days",
      bg: "#FEF3C7",
    },
  ];

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col card-lift">
      {/* Title */}
      <div className="mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          Productivity Score
        </h2>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 136 136">
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="rgba(15, 23, 42, 0.06)"
              strokeWidth="8"
            />
            <motion.circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: isLoading ? circumference : strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold"
              style={{ color: scoreColor, fontFamily: "var(--font-jetbrains), monospace" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {isLoading ? "--" : score}
            </motion.span>
            <span
              className="text-[10px] tracking-wider"
              style={{ color: "#94A3B8" }}
            >
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="text-center mb-5">
        <p
          className="text-[10px] tracking-wide"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          Tasks × 0.4 + Focus × 0.3 + Habits × 0.3
        </p>
      </div>

      {/* Stat Rows */}
      <div className="flex flex-col gap-2 flex-1">
        {statRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-3 py-2 rounded-xl"
            style={{ background: "rgba(15, 23, 42, 0.02)", border: "1px solid rgba(15,23,42,0.04)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: row.bg }}
              >
                {row.icon}
              </div>
              <span
                className="text-xs"
                style={{ color: "#475569", fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                {row.label}
              </span>
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: "#0F172A", fontFamily: "var(--font-jetbrains), monospace" }}
            >
              {isLoading ? "--" : row.value}
              {row.unit && (
                <span className="ml-1 font-normal" style={{ color: "#94A3B8" }}>
                  {row.unit}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
