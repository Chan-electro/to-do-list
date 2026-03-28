import { router } from "../server";
import { taskRouter } from "./tasks";
import { timerRouter } from "./timer";
import { habitRouter } from "./habits";
import { noteRouter } from "./notes";
import { dashboardRouter } from "./dashboard";
import { authRouter } from "./auth";

export const appRouter = router({
  task: taskRouter,
  timer: timerRouter,
  habit: habitRouter,
  note: noteRouter,
  dashboard: dashboardRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
