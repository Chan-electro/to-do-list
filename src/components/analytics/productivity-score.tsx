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

  // Score formula: Tasks × 0.4 + Focus × 0.3 + Habits × 0.3
  // Normalize: tasks out of 10, focus out of 120 min, habits as completion rate
  const taskScore = Math.min((tasksCompleted / 10) * 100, 100);
  const focusScore = Math.min((focusMinutes / 120) * 100, 100);
  const habitScore = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0;
  const score = Math.round(taskScore * 0.4 + focusScore * 0.3 + habitScore * 0.3);

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80 ? "#00FF88" : score >= 50 ? "#00D4FF" : score >= 30 ? "#FFB800" : "#FF3366";

  const statRows = [
    {
      icon: <CheckSquare className="w-4 h-4 text-[#00D4FF]" />,
      label: "Tasks Completed",
      value: tasksCompleted,
      unit: "today",
    },
    {
      icon: <Clock className="w-4 h-4 text-[#7B2FFF]" />,
      label: "Focus Time",
      value: focusMinutes,
      unit: "min",
    },
    {
      icon: <Zap className="w-4 h-4 text-[#00FF88]" />,
      label: "Habits Done",
      value: `${habitsCompleted}/${habitsTotal}`,
      unit: "",
    },
    {
      icon: <Flame className="w-4 h-4 text-[#FFB800]" />,
      label: "Best Streak",
      value: bestStreak,
      unit: "days",
    },
  ];

  return (
    <div
      className="rounded-xl p-6 h-full flex flex-col"
      style={{
        background: "rgba(26,26,62,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-sm font-mono font-semibold text-[#8888AA] uppercase tracking-widest">
          Productivity Score
        </h2>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 136 136">
            {/* Track */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            {/* Progress */}
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
              style={{ filter: `drop-shadow(0 0 8px ${scoreColor}60)` }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-mono font-bold"
              style={{ color: scoreColor }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {isLoading ? "--" : score}
            </motion.span>
            <span className="text-[10px] text-[#8888AA] font-mono tracking-wider">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="text-center mb-5">
        <p className="text-[10px] font-mono text-[#8888AA]/70 tracking-wide">
          Tasks × 0.4 + Focus × 0.3 + Habits × 0.3
        </p>
      </div>

      {/* Stat Rows */}
      <div className="flex flex-col gap-2 flex-1">
        {statRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-3 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex items-center gap-2">
              {row.icon}
              <span className="text-xs text-[#8888AA] font-mono">{row.label}</span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#E8E8F0]">
              {isLoading ? "--" : row.value}
              {row.unit && (
                <span className="text-[#8888AA] ml-1 font-normal">{row.unit}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
