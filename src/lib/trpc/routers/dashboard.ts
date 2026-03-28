import { eq, and, isNull, sql, count, or } from "drizzle-orm";
import { router, protectedProcedure } from "@/lib/trpc/server";
import { db, schema } from "@/db";

const { tasks, timeSessions, habits, habitLogs, dailyScores } = schema;

export const dashboardRouter = router({
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const userId = ctx.userId;

    // Task counts — include user's own + shared tasks
    const taskCountRows = await db
      .select({
        status: tasks.status,
        count: count(),
      })
      .from(tasks)
      .where(
        or(
          eq(tasks.userId, userId),
          eq(tasks.isShared, 1)
        ) as ReturnType<typeof eq>
      )
      .groupBy(tasks.status);

    const taskCounts: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      done: 0,
      blocked: 0,
      cancelled: 0,
    };

    for (const row of taskCountRows) {
      taskCounts[row.status] = row.count;
    }

    const totalTasks = taskCountRows.reduce((sum, r) => sum + r.count, 0);

    // Tasks completed today
    const completedTodayRows = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          sql`date(${tasks.completedAt}) = ${todayDate}`,
          or(
            eq(tasks.userId, userId),
            eq(tasks.isShared, 1)
          ) as ReturnType<typeof eq>
        )
      );

    const tasksCompletedToday = completedTodayRows[0]?.count ?? 0;

    // Active timer session
    const activeSession = await db
      .select()
      .from(timeSessions)
      .where(
        and(
          isNull(timeSessions.endedAt),
          eq(timeSessions.userId, userId)
        )
      )
      .limit(1);

    // Focus minutes today
    const todaySessionRows = await db
      .select()
      .from(timeSessions)
      .where(
        and(
          sql`date(${timeSessions.startedAt}) = ${todayDate}`,
          eq(timeSessions.completed, true),
          eq(timeSessions.userId, userId)
        )
      );

    const focusMinutesToday = Math.floor(
      todaySessionRows.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0) /
        60
    );

    const pomodorosToday = todaySessionRows.filter(
      (s) => s.type === "pomodoro"
    ).length;

    // Habit completion today
    const activeHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.isActive, true), eq(habits.userId, userId)));

    const todayHabitLogs = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.date, todayDate),
          eq(habitLogs.completed, true),
          eq(habitLogs.userId, userId)
        )
      );

    const habitsCompleted = todayHabitLogs.length;
    const habitsTotal = activeHabits.length;
    const habitCompletionRate =
      habitsTotal > 0
        ? Math.round((habitsCompleted / habitsTotal) * 100)
        : 0;

    // Daily score
    const dailyScoreRow = await db
      .select()
      .from(dailyScores)
      .where(
        and(
          eq(dailyScores.date, todayDate),
          eq(dailyScores.userId, userId)
        )
      )
      .limit(1);

    const productivityScore = dailyScoreRow[0]?.productivityScore ?? 0;
    const totalXp = dailyScoreRow[0]?.totalXp ?? 0;

    // Best habit streak
    const bestStreakHabit = activeHabits.reduce(
      (best, habit) =>
        (habit.streakCurrent ?? 0) > (best.streakCurrent ?? 0) ? habit : best,
      activeHabits[0] ?? null
    );

    return {
      date: todayDate,
      tasks: {
        ...taskCounts,
        total: totalTasks,
        completedToday: tasksCompletedToday,
      },
      timer: {
        activeSession: activeSession[0] ?? null,
        focusMinutesToday,
        pomodorosToday,
      },
      habits: {
        completed: habitsCompleted,
        total: habitsTotal,
        completionRate: habitCompletionRate,
        bestStreak: bestStreakHabit
          ? {
              habitId: bestStreakHabit.id,
              habitName: bestStreakHabit.name,
              streak: bestStreakHabit.streakCurrent ?? 0,
            }
          : null,
      },
      productivity: {
        score: productivityScore,
        totalXp,
      },
    };
  }),
});
