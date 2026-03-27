"use client";

import { AchievementBadge } from "./achievement-badge";

const ACHIEVEMENTS = [
  {
    code: "first_task",
    name: "First Task",
    description: "Complete your very first task.",
    icon: "✅",
  },
  {
    code: "streak_7",
    name: "7-Day Streak",
    description: "Maintain a 7-day productivity streak.",
    icon: "🔥",
  },
  {
    code: "streak_30",
    name: "30-Day Streak",
    description: "Maintain a 30-day productivity streak.",
    icon: "⚡",
  },
  {
    code: "tasks_100",
    name: "Centurion",
    description: "Complete 100 tasks in total.",
    icon: "💯",
  },
  {
    code: "pomodoro_100",
    name: "Focus Master",
    description: "Complete 100 Pomodoro sessions.",
    icon: "🍅",
  },
  {
    code: "early_bird",
    name: "Early Bird",
    description: "Complete a task before 8 AM.",
    icon: "🌅",
  },
  {
    code: "night_owl",
    name: "Night Owl",
    description: "Complete a task after 10 PM.",
    icon: "🦉",
  },
];

// Phase 4: wire real unlock logic via API
const UNLOCKED_CODES: string[] = [];

export function AchievementsGrid() {
  const unlockedCount = ACHIEVEMENTS.filter((a) =>
    UNLOCKED_CODES.includes(a.code)
  ).length;

  return (
    <div className="rounded-xl bg-[rgba(26,26,62,0.6)] backdrop-blur-xl border border-white/[0.06] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono font-semibold text-[#E8E8F0] uppercase tracking-wider">
          Achievements
        </h3>
        <span className="text-xs font-mono text-[#8888AA]">
          {unlockedCount} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementBadge
            key={achievement.code}
            code={achievement.code}
            name={achievement.name}
            description={achievement.description}
            icon={achievement.icon}
            unlocked={UNLOCKED_CODES.includes(achievement.code)}
          />
        ))}
      </div>
    </div>
  );
}
