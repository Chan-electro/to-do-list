import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { v4 as uuid } from "uuid";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";

function hashPin(userId: string, pin: string): string {
  return createHash("sha256")
    .update(`${userId}:nexus:${pin}`)
    .digest("hex");
}

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), "data", "nexus.db");
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("🚀 Seeding Nexus database...");

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Chandan',
      pin_hash TEXT,
      settings_json TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL DEFAULT 'personal',
      color TEXT DEFAULT '#00D4FF',
      icon TEXT DEFAULT 'folder',
      status TEXT DEFAULT 'active',
      deadline TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      domain TEXT NOT NULL DEFAULT 'personal',
      project_id TEXT REFERENCES projects(id),
      priority TEXT NOT NULL DEFAULT 'P3',
      status TEXT NOT NULL DEFAULT 'todo',
      due_date TEXT,
      estimated_minutes INTEGER,
      actual_minutes INTEGER DEFAULT 0,
      tags_json TEXT DEFAULT '[]',
      assignee TEXT DEFAULT 'Self',
      recurrence_rule TEXT,
      parent_task_id TEXT,
      sort_order INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'custom',
      frequency TEXT NOT NULL DEFAULT 'daily',
      target_value REAL DEFAULT 1,
      unit TEXT DEFAULT 'times',
      streak_current INTEGER DEFAULT 0,
      streak_best INTEGER DEFAULT 0,
      xp_per_completion INTEGER DEFAULT 5,
      color TEXT DEFAULT '#00D4FF',
      icon TEXT DEFAULT 'check',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES habits(id),
      date TEXT NOT NULL,
      value REAL DEFAULT 0,
      completed INTEGER DEFAULT 0,
      streak_frozen INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS time_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT REFERENCES tasks(id),
      type TEXT NOT NULL DEFAULT 'pomodoro',
      started_at TEXT NOT NULL,
      ended_at TEXT,
      duration_seconds INTEGER DEFAULT 0,
      distractions_count INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled',
      content_md TEXT DEFAULT '',
      folder TEXT DEFAULT 'inbox',
      tags_json TEXT DEFAULT '[]',
      is_inbox INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT REFERENCES tasks(id),
      trigger_at TEXT NOT NULL,
      channel TEXT DEFAULT 'browser',
      status TEXT DEFAULT 'pending',
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_scores (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      tasks_completed INTEGER DEFAULT 0,
      focus_minutes INTEGER DEFAULT 0,
      habits_done INTEGER DEFAULT 0,
      total_xp INTEGER DEFAULT 0,
      productivity_score INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'trophy',
      unlocked_at TEXT
    );
  `);

  // Seed default user (PIN: 1234)
  const defaultUserId = uuid();
  db.insert(schema.users).values({
    id: defaultUserId,
    name: "Chandan",
    pinHash: hashPin(defaultUserId, "1234"),
    settingsJson: JSON.stringify({ timezone: "Asia/Kolkata" }),
  }).onConflictDoNothing().run();

  // Seed projects
  const projectIds = {
    adgrades: uuid(),
    pureBlend: uuid(),
    freshFluffy: uuid(),
    personal: uuid(),
  };

  db.insert(schema.projects).values([
    { id: projectIds.adgrades, userId: defaultUserId, name: "AdGrades", domain: "professional", color: "#00D4FF", icon: "building" },
    { id: projectIds.pureBlend, userId: defaultUserId, name: "Pure Blend", domain: "professional", color: "#7B2FFF", icon: "coffee" },
    { id: projectIds.freshFluffy, userId: defaultUserId, name: "Fresh And Fluffy", domain: "professional", color: "#00FF88", icon: "cake" },
    { id: projectIds.personal, userId: defaultUserId, name: "Personal Growth", domain: "personal", color: "#FFB800", icon: "user" },
  ]).onConflictDoNothing().run();

  // Seed sample tasks
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  db.insert(schema.tasks).values([
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Review Q2 campaign strategy for Bon Millette", domain: "professional", projectId: projectIds.adgrades, priority: "P1", status: "todo", dueDate: tomorrow, estimatedMinutes: 60, assignee: "Self", tagsJson: JSON.stringify(["strategy", "client"]) },
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Design social media templates for Pure Blend", domain: "professional", projectId: projectIds.pureBlend, priority: "P2", status: "in_progress", dueDate: tomorrow, estimatedMinutes: 120, assignee: "Likitesh", tagsJson: JSON.stringify(["design", "social"]) },
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Fresh And Fluffy - product photography shoot", domain: "professional", projectId: projectIds.freshFluffy, priority: "P2", status: "todo", dueDate: nextWeek, estimatedMinutes: 180, assignee: "Ashish", tagsJson: JSON.stringify(["photography", "content"]) },
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Weekly team sync - AdGrades", domain: "professional", projectId: projectIds.adgrades, priority: "P1", status: "todo", dueDate: tomorrow, estimatedMinutes: 30, assignee: "Self", tagsJson: JSON.stringify(["meeting"]), recurrenceRule: "weekly" },
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Workout - Upper body", domain: "personal", priority: "P3", status: "todo", dueDate: tomorrow, estimatedMinutes: 45, tagsJson: JSON.stringify(["health", "fitness"]) },
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Read 30 pages - Atomic Habits", domain: "personal", priority: "P4", status: "todo", estimatedMinutes: 30, tagsJson: JSON.stringify(["reading", "learning"]) },
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Call Maneesh about new leads", domain: "professional", projectId: projectIds.adgrades, priority: "P2", status: "todo", dueDate: tomorrow + "T15:00", estimatedMinutes: 15, assignee: "Self", tagsJson: JSON.stringify(["sales", "leads"]) },
    { id: uuid(), userId: defaultUserId, createdByUserId: defaultUserId, title: "Invoice clients for March", domain: "professional", projectId: projectIds.adgrades, priority: "P1", status: "todo", dueDate: nextWeek, estimatedMinutes: 60, tagsJson: JSON.stringify(["finance", "billing"]) },
  ]).onConflictDoNothing().run();

  // Seed sample habits
  db.insert(schema.habits).values([
    { id: uuid(), userId: defaultUserId, name: "Workout", category: "health", targetValue: 1, unit: "session", color: "#00FF88", icon: "dumbbell" },
    { id: uuid(), userId: defaultUserId, name: "Water Intake", category: "health", targetValue: 8, unit: "glasses", color: "#00D4FF", icon: "droplets" },
    { id: uuid(), userId: defaultUserId, name: "Reading", category: "learning", targetValue: 30, unit: "pages", color: "#FFB800", icon: "book-open" },
    { id: uuid(), userId: defaultUserId, name: "Meditation", category: "mindfulness", targetValue: 10, unit: "minutes", color: "#7B2FFF", icon: "brain" },
    { id: uuid(), userId: defaultUserId, name: "Client Check-ins", category: "professional", targetValue: 3, unit: "calls", color: "#FF3366", icon: "phone" },
  ]).onConflictDoNothing().run();

  // Seed achievements (locked by default)
  db.insert(schema.achievements).values([
    { id: uuid(), userId: defaultUserId, code: "first_task", name: "First Steps", description: "Complete your first task", icon: "rocket" },
    { id: uuid(), userId: defaultUserId, code: "streak_7", name: "On Fire", description: "Maintain a 7-day streak", icon: "flame" },
    { id: uuid(), userId: defaultUserId, code: "streak_30", name: "Unstoppable", description: "Maintain a 30-day streak", icon: "zap" },
    { id: uuid(), userId: defaultUserId, code: "tasks_100", name: "Centurion", description: "Complete 100 tasks", icon: "award" },
    { id: uuid(), userId: defaultUserId, code: "pomodoro_100", name: "Focus Master", description: "Complete 100 Pomodoro sessions", icon: "target" },
    { id: uuid(), userId: defaultUserId, code: "early_bird", name: "Early Bird", description: "Complete a task before 7 AM", icon: "sunrise" },
    { id: uuid(), userId: defaultUserId, code: "night_owl", name: "Night Owl", description: "Complete a task after 11 PM", icon: "moon" },
  ]).onConflictDoNothing().run();

  console.log("✅ Nexus database seeded successfully!");
}

seed().catch(console.error);
