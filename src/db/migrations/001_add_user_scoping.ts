/**
 * Migration 001: Add user scoping to all data tables
 * Run with: npx tsx src/db/migrations/001_add_user_scoping.ts
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH =
  process.env.DATABASE_URL || path.join(process.cwd(), "data", "nexus.db");

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Database not found at: ${DB_PATH}`);
  console.error("   Run 'npm run db:seed' first to create the database.");
  process.exit(1);
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = OFF");

function addColumnIfNotExists(
  table: string,
  column: string,
  type: string,
  defaultVal: string
) {
  try {
    sqlite.exec(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${type} DEFAULT ${defaultVal}`
    );
    console.log(`  ✓ Added ${column} to ${table}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("duplicate column")) {
      console.log(`  ○ ${column} already exists in ${table} (skipped)`);
    } else {
      throw e;
    }
  }
}

function migrate() {
  console.log("🔄 Running migration: 001_add_user_scoping\n");

  // Find primary user
  const primaryUser = sqlite
    .prepare("SELECT id, name FROM users LIMIT 1")
    .get() as { id: string; name: string } | undefined;

  if (!primaryUser) {
    console.error(
      "❌ No users found in database. Run db:seed first."
    );
    process.exit(1);
  }

  const userId = primaryUser.id;
  console.log(
    `  Primary user: "${primaryUser.name}" (${userId})\n`
  );

  // ── Add user_id to core data tables ──────────────────────────────────
  const dataTables = [
    "tasks",
    "habits",
    "habit_logs",
    "time_sessions",
    "notes",
    "reminders",
    "projects",
    "daily_scores",
    "achievements",
  ];

  for (const table of dataTables) {
    addColumnIfNotExists(table, "user_id", "TEXT", "NULL");
    const updated = sqlite
      .prepare(`UPDATE ${table} SET user_id = ? WHERE user_id IS NULL`)
      .run(userId);
    if (updated.changes > 0) {
      console.log(`  ✓ Backfilled user_id for ${updated.changes} rows in ${table}`);
    }
  }

  console.log("");

  // ── Add shared task columns ───────────────────────────────────────────
  addColumnIfNotExists("tasks", "is_shared", "INTEGER", "0");
  addColumnIfNotExists("tasks", "created_by_user_id", "TEXT", "NULL");

  // Backfill created_by_user_id for existing tasks
  const backfilled = sqlite
    .prepare(
      "UPDATE tasks SET created_by_user_id = ? WHERE created_by_user_id IS NULL"
    )
    .run(userId);
  if (backfilled.changes > 0) {
    console.log(
      `  ✓ Backfilled created_by_user_id for ${backfilled.changes} tasks`
    );
  }

  console.log("\n✅ Migration 001 completed successfully!");
}

try {
  migrate();
} catch (err) {
  console.error("❌ Migration failed:", err);
  process.exit(1);
} finally {
  sqlite.close();
}
