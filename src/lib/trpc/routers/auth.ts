import { z } from "zod";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { router, protectedProcedure, publicProcedure } from "@/lib/trpc/server";
import { db, schema } from "@/db";
import { hashPin } from "@/lib/auth";

const { users } = schema;

export const authRouter = router({
  /** List all users (for user switcher / team members UI) */
  listUsers: protectedProcedure.query(async () => {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
    return result;
  }),

  /** Create a new team member (admin only — no role system yet, all authenticated users can do this) */
  createUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        pin: z.string().min(4).max(12).regex(/^\d+$/, "PIN must be digits only"),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuid();
      const pinHash = hashPin(id, input.pin);
      const now = new Date().toISOString();

      await db.insert(users).values({
        id,
        name: input.name,
        pinHash,
        settingsJson: "{}",
        createdAt: now,
      });

      const created = await db
        .select({ id: users.id, name: users.name, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return created[0];
    }),

  /** Update a user's PIN */
  updatePin: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        newPin: z.string().min(4).max(12).regex(/^\d+$/, "PIN must be digits only"),
      })
    )
    .mutation(async ({ input }) => {
      const pinHash = hashPin(input.userId, input.newPin);
      await db
        .update(users)
        .set({ pinHash })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** Delete a user */
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Prevent self-deletion
      if (input.userId === ctx.userId) {
        throw new Error("Cannot delete your own account.");
      }
      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** Get the logged-in user's profile */
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) return null;
    const result = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);
    return result[0] ?? null;
  }),
});
