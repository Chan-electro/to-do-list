import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

// ─── Context ─────────────────────────────────────────────────────────────────
export interface Context {
  userId: string | null;
  userName: string | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// ─── Procedures ──────────────────────────────────────────────────────────────
export const router = t.router;

/** Unrestricted — used for auth routes (login, setup check) */
export const publicProcedure = t.procedure;

/** Requires a valid session. Narrows ctx.userId to string. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userName: ctx.userName,
    },
  });
});

export const createCallerFactory = t.createCallerFactory;
