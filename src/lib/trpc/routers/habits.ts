import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { router, publicProcedure } from "@/lib/trpc/server";
import { db, schema } from "@/db";

const { habits, habitLogs } = schema;

export const habitRouter = router({
  list: publicProcedure.query(async () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.isActive, true));

    const todayLogs = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.date, todayDate));

    const logsByHabitId = new Map(todayLogs.map((log) => [log.habitId, log]));

    return allHabits.map((habit) => ({
      ...habit,
      todayLog: logsByHabitId.get(habit.id) ?? null,
      completedToday: logsByHabitId.get(habit.id)?.completed ?? false,
    }));
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        category: z.string().optional(),
        frequency: z.string().optional(),
        targetValue: z.number().positive().optional(),
        unit: z.string().optional(),
        xpPerCompletion: z.number().int().positive().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuid();
      const now = new Date().toISOString();

      await db.insert(habits).values({
        id,
        name: input.name,
        category: input.category ?? "custom",
        frequency: input.frequency ?? "daily",
        targetValue: input.targetValue ?? 1,
        unit: input.unit ?? "times",
        streakCurrent: 0,
        streakBest: 0,
        xpPerCompletion: input.xpPerCompletion ?? 5,
        color: input.color ?? "#00D4FF",
        icon: input.icon ?? "check",
        isActive: true,
        createdAt: now,
      });

      const created = await db
        .select()
        .from(habits)
        .where(eq(habits.id, id))
        .limit(1);

      return created[0];
    }),

  toggleLog: publicProcedure
    .input(
      z.object({
        habitId: z.string(),
        date: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const existingLog = await db
        .select()
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.habitId, input.habitId),
            eq(habitLogs.date, input.date)
          )
        )
        .limit(1);

      if (existingLog.length > 0) {
        const log = existingLog[0];
        const newCompleted = !log.completed;

        await db
          .update(habitLogs)
          .set({
            completed: newCompleted,
            value: newCompleted ? 1 : 0,
          })
          .where(eq(habitLogs.id, log.id));

        // Update habit streak
        await updateHabitStreak(input.habitId);

        const updated = await db
          .select()
          .from(habitLogs)
          .where(eq(habitLogs.id, log.id))
          .limit(1);

        return { log: updated[0], toggled: true };
      } else {
        const id = uuid();
        const now = new Date().toISOString();

        await db.insert(habitLogs).values({
          id,
          habitId: input.habitId,
          date: input.date,
          value: 1,
          completed: true,
          streakFrozen: false,
          createdAt: now,
        });

        // Update habit streak
        await updateHabitStreak(input.habitId);

        const created = await db
          .select()
          .from(habitLogs)
          .where(eq(habitLogs.id, id))
          .limit(1);

        return { log: created[0], toggled: true };
      }
    }),

  getStreaks: publicProcedure.query(async () => {
    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.isActive, true));

    return allHabits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      streakCurrent: habit.streakCurrent ?? 0,
      streakBest: habit.streakBest ?? 0,
      color: habit.color,
      icon: habit.icon,
    }));
  }),

  getHeatmap: publicProcedure
    .input(z.object({ habitId: z.string() }))
    .query(async ({ input }) => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const fromDate = ninetyDaysAgo.toISOString().slice(0, 10);

      const logs = await db
        .select()
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.habitId, input.habitId),
            sql`${habitLogs.date} >= ${fromDate}`
          )
        )
        .orderBy(desc(habitLogs.date));

      return logs;
    }),
});

async function updateHabitStreak(habitId: string): Promise<void> {
  const logs = await db
    .select()
    .from(habitLogs)
    .where(
      and(eq(habitLogs.habitId, habitId), eq(habitLogs.completed, true))
    )
    .orderBy(desc(habitLogs.date));

  if (logs.length === 0) {
    await db
      .update(habits)
      .set({ streakCurrent: 0 })
      .where(eq(habits.id, habitId));
    return;
  }

  // Calculate current streak (consecutive days ending today or yesterday)
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    const logDateStr = logDate.toISOString().slice(0, 10);
    const expectedDateStr = expectedDate.toISOString().slice(0, 10);

    if (logDateStr === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }

  // Calculate best streak
  let bestStreak = 0;
  let currentRun = 1;

  for (let i = 1; i < logs.length; i++) {
    const prev = new Date(logs[i - 1].date);
    const curr = new Date(logs[i].date);
    const diffDays =
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentRun++;
    } else {
      bestStreak = Math.max(bestStreak, currentRun);
      currentRun = 1;
    }
  }
  bestStreak = Math.max(bestStreak, currentRun);

  const habit = await db
    .select()
    .from(habits)
    .where(eq(habits.id, habitId))
    .limit(1);

  const currentBest = habit[0]?.streakBest ?? 0;

  await db
    .update(habits)
    .set({
      streakCurrent: streak,
      streakBest: Math.max(bestStreak, currentBest),
    })
    .where(eq(habits.id, habitId));
}
