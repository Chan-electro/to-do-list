import { z } from "zod";
import { eq, desc, isNull, sql, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { router, protectedProcedure } from "@/lib/trpc/server";
import { db, schema } from "@/db";

const { timeSessions } = schema;

export const timerRouter = router({
  startSession: protectedProcedure
    .input(
      z.object({
        taskId: z.string().optional(),
        type: z.enum(["pomodoro", "stopwatch", "timer"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = uuid();
      const now = new Date().toISOString();

      await db.insert(timeSessions).values({
        id,
        userId: ctx.userId,
        taskId: input.taskId ?? null,
        type: input.type,
        startedAt: now,
        endedAt: null,
        durationSeconds: 0,
        distractionsCount: 0,
        completed: false,
        createdAt: now,
      });

      const created = await db
        .select()
        .from(timeSessions)
        .where(eq(timeSessions.id, id))
        .limit(1);

      return created[0];
    }),

  endSession: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        durationSeconds: z.number().int().min(0),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date().toISOString();

      await db
        .update(timeSessions)
        .set({
          endedAt: now,
          durationSeconds: input.durationSeconds,
          completed: input.completed,
        })
        .where(
          and(
            eq(timeSessions.id, input.id),
            eq(timeSessions.userId, ctx.userId)
          )
        );

      const updated = await db
        .select()
        .from(timeSessions)
        .where(eq(timeSessions.id, input.id))
        .limit(1);

      return updated[0] ?? null;
    }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select()
      .from(timeSessions)
      .where(
        and(
          isNull(timeSessions.endedAt),
          eq(timeSessions.userId, ctx.userId)
        )
      )
      .limit(1);

    return result[0] ?? null;
  }),

  logDistraction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(timeSessions)
        .set({
          distractionsCount: sql`${timeSessions.distractionsCount} + 1`,
        })
        .where(
          and(
            eq(timeSessions.id, input.id),
            eq(timeSessions.userId, ctx.userId)
          )
        );

      const updated = await db
        .select()
        .from(timeSessions)
        .where(eq(timeSessions.id, input.id))
        .limit(1);

      return updated[0] ?? null;
    }),

  getHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().positive().default(20),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 20;

      const results = await db
        .select()
        .from(timeSessions)
        .where(eq(timeSessions.userId, ctx.userId))
        .orderBy(desc(timeSessions.startedAt))
        .limit(limit);

      return results;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const todayDate = new Date().toISOString().slice(0, 10);

    const todaySessions = await db
      .select()
      .from(timeSessions)
      .where(
        and(
          sql`date(${timeSessions.startedAt}) = ${todayDate}`,
          eq(timeSessions.completed, true),
          eq(timeSessions.userId, ctx.userId)
        )
      );

    const totalPomodorosToday = todaySessions.filter(
      (s) => s.type === "pomodoro"
    ).length;

    const totalFocusSecondsToday = todaySessions.reduce(
      (sum, s) => sum + (s.durationSeconds ?? 0),
      0
    );
    const totalFocusMinutesToday = Math.floor(totalFocusSecondsToday / 60);

    const allSessions = await db
      .select()
      .from(timeSessions)
      .where(
        and(
          sql`date(${timeSessions.startedAt}) = ${todayDate}`,
          eq(timeSessions.userId, ctx.userId)
        )
      );

    const sessionsWithDuration = allSessions.filter(
      (s) => (s.durationSeconds ?? 0) > 0
    );

    const averageSessionDuration =
      sessionsWithDuration.length > 0
        ? Math.floor(
            sessionsWithDuration.reduce(
              (sum, s) => sum + (s.durationSeconds ?? 0),
              0
            ) / sessionsWithDuration.length
          )
        : 0;

    return {
      totalPomodorosToday,
      totalFocusMinutesToday,
      averageSessionDurationSeconds: averageSessionDuration,
    };
  }),
});
