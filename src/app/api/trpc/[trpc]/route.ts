import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/routers";
import type { Context } from "@/lib/trpc/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts): Context => ({
      userId: opts.req.headers.get("x-user-id") ?? null,
      userName: opts.req.headers.get("x-user-name") ?? null,
    }),
  });

export { handler as GET, handler as POST };
