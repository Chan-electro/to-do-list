import { z } from "zod";
import { eq, and, like, desc, asc, sql, count, or } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { router, protectedProcedure } from "@/lib/trpc/server";
import { db, schema } from "@/db";

const { tasks } = schema;

export const taskRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          priority: z.string().optional(),
          domain: z.string().optional(),
          assignee: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const filters: ReturnType<typeof eq>[] = [];

      // Only show user's own tasks OR shared tasks
      filters.push(
        or(
          eq(tasks.userId, ctx.userId),
          eq(tasks.isShared, 1)
        ) as ReturnType<typeof eq>
      );

      if (input?.status) {
        filters.push(eq(tasks.status, input.status));
      }
      if (input?.priority) {
        filters.push(eq(tasks.priority, input.priority));
      }
      if (input?.domain) {
        // "team" domain returns only shared tasks
        if (input.domain === "team") {
          filters.push(eq(tasks.isShared, 1));
        } else {
          filters.push(eq(tasks.domain, input.domain));
          filters.push(eq(tasks.userId, ctx.userId));
        }
      }
      if (input?.assignee) {
        filters.push(eq(tasks.assignee, input.assignee));
      }
      if (input?.search) {
        filters.push(like(tasks.title, `%${input.search}%`));
      }

      const results = await db
        .select()
        .from(tasks)
        .where(and(...filters))
        .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));

      return results;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.id, input.id),
            or(eq(tasks.userId, ctx.userId), eq(tasks.isShared, 1)) as ReturnType<typeof eq>
          )
        )
        .limit(1);

      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        domain: z.string().optional(),
        projectId: z.string().optional(),
        priority: z.string().optional(),
        status: z.string().optional(),
        dueDate: z.string().optional(),
        estimatedMinutes: z.number().int().positive().optional(),
        tagsJson: z.string().optional(),
        assignee: z.string().optional(),
        recurrenceRule: z.string().optional(),
        parentTaskId: z.string().optional(),
        isShared: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = uuid();
      const now = new Date().toISOString();

      await db.insert(tasks).values({
        id,
        userId: ctx.userId,
        title: input.title,
        description: input.description ?? "",
        domain: input.domain ?? "personal",
        projectId: input.projectId ?? null,
        priority: input.priority ?? "P3",
        status: input.status ?? "todo",
        dueDate: input.dueDate ?? null,
        estimatedMinutes: input.estimatedMinutes ?? null,
        tagsJson: input.tagsJson ?? "[]",
        assignee: input.assignee ?? ctx.userName ?? "Self",
        recurrenceRule: input.recurrenceRule ?? null,
        parentTaskId: input.parentTaskId ?? null,
        sortOrder: 0,
        isShared: input.isShared ? 1 : 0,
        createdByUserId: ctx.userId,
        createdAt: now,
        updatedAt: now,
      });

      const created = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      return created[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        domain: z.string().optional(),
        projectId: z.string().nullable().optional(),
        priority: z.string().optional(),
        status: z.string().optional(),
        dueDate: z.string().nullable().optional(),
        estimatedMinutes: z.number().int().positive().nullable().optional(),
        tagsJson: z.string().optional(),
        assignee: z.string().optional(),
        recurrenceRule: z.string().nullable().optional(),
        parentTaskId: z.string().nullable().optional(),
        sortOrder: z.number().int().optional(),
        completedAt: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...fields } = input;
      const now = new Date().toISOString();

      // Allow update if: own task OR shared task
      await db
        .update(tasks)
        .set({ ...fields, updatedAt: now })
        .where(
          and(
            eq(tasks.id, id),
            or(eq(tasks.userId, ctx.userId), eq(tasks.isShared, 1)) as ReturnType<typeof eq>
          )
        );

      const updated = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      return updated[0] ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Only delete own tasks
      await db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)));
      return { success: true, id: input.id };
    }),

  reorder: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          sortOrder: z.number().int(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const now = new Date().toISOString();

      for (const item of input) {
        await db
          .update(tasks)
          .set({ sortOrder: item.sortOrder, updatedAt: now })
          .where(eq(tasks.id, item.id));
      }

      return { success: true, updated: input.length };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        status: tasks.status,
        count: count(),
      })
      .from(tasks)
      .where(
        or(
          eq(tasks.userId, ctx.userId),
          eq(tasks.isShared, 1)
        ) as ReturnType<typeof eq>
      )
      .groupBy(tasks.status);

    const stats: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      done: 0,
      blocked: 0,
      cancelled: 0,
    };

    for (const row of rows) {
      stats[row.status] = row.count;
    }

    const total = rows.reduce((sum, r) => sum + r.count, 0);

    return { ...stats, total };
  }),

  /** List only shared/team tasks */
  listShared: protectedProcedure.query(async () => {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.isShared, 1))
      .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));
  }),

  /** Create a shared/team task */
  createShared: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        priority: z.string().optional(),
        assignee: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = uuid();
      const now = new Date().toISOString();

      await db.insert(tasks).values({
        id,
        userId: ctx.userId,
        title: input.title,
        description: "",
        domain: "team",
        priority: input.priority ?? "P3",
        status: "todo",
        dueDate: input.dueDate ?? null,
        tagsJson: "[]",
        assignee: input.assignee ?? ctx.userName ?? "Team",
        sortOrder: 0,
        isShared: 1,
        createdByUserId: ctx.userId,
        createdAt: now,
        updatedAt: now,
      });

      const created = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      return created[0];
    }),
});
