import { z } from "zod";
import { eq, and, like, desc, asc, sql, count } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { router, publicProcedure } from "@/lib/trpc/server";
import { db, schema } from "@/db";

const { tasks } = schema;

export const taskRouter = router({
  list: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        domain: z.string().optional(),
        assignee: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const filters = [];

      if (input?.status) {
        filters.push(eq(tasks.status, input.status));
      }
      if (input?.priority) {
        filters.push(eq(tasks.priority, input.priority));
      }
      if (input?.domain) {
        filters.push(eq(tasks.domain, input.domain));
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
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));

      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),

  create: publicProcedure
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
      })
    )
    .mutation(async ({ input }) => {
      const id = uuid();
      const now = new Date().toISOString();

      await db.insert(tasks).values({
        id,
        title: input.title,
        description: input.description ?? "",
        domain: input.domain ?? "personal",
        projectId: input.projectId ?? null,
        priority: input.priority ?? "P3",
        status: input.status ?? "todo",
        dueDate: input.dueDate ?? null,
        estimatedMinutes: input.estimatedMinutes ?? null,
        tagsJson: input.tagsJson ?? "[]",
        assignee: input.assignee ?? "Self",
        recurrenceRule: input.recurrenceRule ?? null,
        parentTaskId: input.parentTaskId ?? null,
        sortOrder: 0,
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

  update: publicProcedure
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
    .mutation(async ({ input }) => {
      const { id, ...fields } = input;
      const now = new Date().toISOString();

      await db
        .update(tasks)
        .set({ ...fields, updatedAt: now })
        .where(eq(tasks.id, id));

      const updated = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      return updated[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true, id: input.id };
    }),

  reorder: publicProcedure
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

  getStats: publicProcedure.query(async () => {
    const rows = await db
      .select({
        status: tasks.status,
        count: count(),
      })
      .from(tasks)
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
});
