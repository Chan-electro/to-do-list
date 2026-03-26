import { z } from "zod";
import { eq, and, like, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { router, publicProcedure } from "@/lib/trpc/server";
import { db, schema } from "@/db";

const { notes } = schema;

export const noteRouter = router({
  list: publicProcedure
    .input(
      z.object({
        folder: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const filters = [];

      if (input?.folder) {
        filters.push(eq(notes.folder, input.folder));
      }
      if (input?.search) {
        filters.push(
          like(notes.title, `%${input.search}%`)
        );
      }

      const results = await db
        .select()
        .from(notes)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(notes.updatedAt));

      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).optional(),
        contentMd: z.string().optional(),
        folder: z.string().optional(),
        tagsJson: z.string().optional(),
        isInbox: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuid();
      const now = new Date().toISOString();

      await db.insert(notes).values({
        id,
        title: input.title ?? "Untitled",
        contentMd: input.contentMd ?? "",
        folder: input.folder ?? "inbox",
        tagsJson: input.tagsJson ?? "[]",
        isInbox: input.isInbox ?? true,
        createdAt: now,
        updatedAt: now,
      });

      const created = await db
        .select()
        .from(notes)
        .where(eq(notes.id, id))
        .limit(1);

      return created[0];
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        contentMd: z.string().optional(),
        folder: z.string().optional(),
        tagsJson: z.string().optional(),
        isInbox: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...fields } = input;
      const now = new Date().toISOString();

      await db
        .update(notes)
        .set({ ...fields, updatedAt: now })
        .where(eq(notes.id, id));

      const updated = await db
        .select()
        .from(notes)
        .where(eq(notes.id, id))
        .limit(1);

      return updated[0] ?? null;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(notes).where(eq(notes.id, input.id));
      return { success: true, id: input.id };
    }),
});
