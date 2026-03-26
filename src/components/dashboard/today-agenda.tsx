"use client";

import { trpc } from "@/lib/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#FF3366",
  P2: "#FFB800",
  P3: "#00D4FF",
  P4: "#8888AA",
};

const DOMAIN_COLORS: Record<string, string> = {
  personal: "#00FF88",
  professional: "#00D4FF",
};

export function TodayAgenda() {
  const { data: tasks, isLoading } = trpc.task.list.useQuery({});
  const utils = trpc.useUtils();

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const handleToggleDone = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    updateTask.mutate({
      id: taskId,
      status: newStatus,
      completedAt: newStatus === "done" ? new Date().toISOString() : null,
    });
  };

  // Filter to today's tasks or show all non-done tasks
  const todayTasks = (tasks ?? [])
    .filter((t) => t.status !== "done" && t.status !== "archived")
    .sort((a, b) => {
      const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
      return (
        (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3)
      );
    })
    .slice(0, 10);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono font-semibold text-[#E8E8F0]">
          Today&apos;s Agenda
        </h2>
        <span className="text-xs font-mono text-[#8888AA]">
          {todayTasks.length} tasks
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      ) : todayTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[#8888AA] text-sm">All clear! No tasks pending.</p>
          <p className="text-[#8888AA]/60 text-xs mt-1">
            Press Ctrl+K to add a new task
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {todayTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-pointer"
              >
                <button
                  onClick={() => handleToggleDone(task.id, task.status)}
                  className="flex-shrink-0"
                >
                  {task.status === "done" ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#8888AA] group-hover:text-[#00D4FF] transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#E8E8F0] truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-[#8888AA]">
                        <Clock className="w-3 h-3" />
                        {task.dueDate.split("T")[0]}
                      </span>
                    )}
                    {task.assignee && task.assignee !== "Self" && (
                      <span className="flex items-center gap-1 text-xs text-[#8888AA]">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    className="text-[10px] font-mono border-0"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[task.priority] ?? "#8888AA"}20`,
                      color: PRIORITY_COLORS[task.priority] ?? "#8888AA",
                    }}
                  >
                    {task.priority}
                  </Badge>
                  <Badge
                    className="text-[10px] border-0 hidden sm:inline-flex"
                    style={{
                      backgroundColor: `${DOMAIN_COLORS[task.domain] ?? "#00D4FF"}15`,
                      color: DOMAIN_COLORS[task.domain] ?? "#00D4FF",
                    }}
                  >
                    {task.domain}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
