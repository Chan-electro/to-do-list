import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("Chandan"),
  pinHash: text("pin_hash"),
  settingsJson: text("settings_json").default("{}"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Projects ────────────────────────────────────────────────────────────────
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().default("personal"),
  color: text("color").default("#00D4FF"),
  icon: text("icon").default("folder"),
  status: text("status").default("active"),
  deadline: text("deadline"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  domain: text("domain").notNull().default("personal"),
  projectId: text("project_id").references(() => projects.id),
  priority: text("priority").notNull().default("P3"),
  status: text("status").notNull().default("todo"),
  dueDate: text("due_date"),
  estimatedMinutes: integer("estimated_minutes"),
  actualMinutes: integer("actual_minutes").default(0),
  tagsJson: text("tags_json").default("[]"),
  assignee: text("assignee").default("Self"),
  recurrenceRule: text("recurrence_rule"),
  parentTaskId: text("parent_task_id"),
  sortOrder: integer("sort_order").default(0),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Habits ──────────────────────────────────────────────────────────────────
export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("custom"),
  frequency: text("frequency").notNull().default("daily"),
  targetValue: real("target_value").default(1),
  unit: text("unit").default("times"),
  streakCurrent: integer("streak_current").default(0),
  streakBest: integer("streak_best").default(0),
  xpPerCompletion: integer("xp_per_completion").default(5),
  color: text("color").default("#00D4FF"),
  icon: text("icon").default("check"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Habit Logs ──────────────────────────────────────────────────────────────
export const habitLogs = sqliteTable("habit_logs", {
  id: text("id").primaryKey(),
  habitId: text("habit_id").notNull().references(() => habits.id),
  date: text("date").notNull(),
  value: real("value").default(0),
  completed: integer("completed", { mode: "boolean" }).default(false),
  streakFrozen: integer("streak_frozen", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Time Sessions ───────────────────────────────────────────────────────────
export const timeSessions = sqliteTable("time_sessions", {
  id: text("id").primaryKey(),
  taskId: text("task_id").references(() => tasks.id),
  type: text("type").notNull().default("pomodoro"), // pomodoro | stopwatch | timer
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationSeconds: integer("duration_seconds").default(0),
  distractionsCount: integer("distractions_count").default(0),
  completed: integer("completed", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Notes ───────────────────────────────────────────────────────────────────
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("Untitled"),
  contentMd: text("content_md").default(""),
  folder: text("folder").default("inbox"),
  tagsJson: text("tags_json").default("[]"),
  isInbox: integer("is_inbox", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Reminders ───────────────────────────────────────────────────────────────
export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  taskId: text("task_id").references(() => tasks.id),
  triggerAt: text("trigger_at").notNull(),
  channel: text("channel").default("browser"),
  status: text("status").default("pending"),
  message: text("message"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Daily Scores ────────────────────────────────────────────────────────────
export const dailyScores = sqliteTable("daily_scores", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(),
  tasksCompleted: integer("tasks_completed").default(0),
  focusMinutes: integer("focus_minutes").default(0),
  habitsDone: integer("habits_done").default(0),
  totalXp: integer("total_xp").default(0),
  productivityScore: integer("productivity_score").default(0),
});

// ─── Achievements ────────────────────────────────────────────────────────────
export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("trophy"),
  unlockedAt: text("unlocked_at"),
});

// ─── Type exports ────────────────────────────────────────────────────────────
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;
export type TimeSession = typeof timeSessions.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type DailyScore = typeof dailyScores.$inferSelect;
