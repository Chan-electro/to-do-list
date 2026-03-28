"use client";

import { trpc } from "@/lib/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#F87171",
  P2: "#FCD34D",
  P3: "#4B8EFF",
  P4: "#4B6080",
};

const DOMAIN_COLORS: Record<string, string> = {
  personal: "#34D399",
  professional: "#4B8EFF",
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
    <div className="glass rounded-2xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(75, 142, 255, 0.06)" }}
      >
        <h2 className="text-lg font-mono font-semibold text-[#F1F5F9]">
          Today&apos;s Agenda
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#94A3B8]">
            {todayTasks.length} tasks
          </span>
          <Link
            href="/tasks"
            className="text-xs font-medium transition-colors duration-200"
            style={{ color: "#4B8EFF" }}
          >
            View all
          </Link>
        </div>
      </div>

      <div className="px-5 py-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg animate-pulse"
                style={{ background: "rgba(75, 142, 255, 0.04)" }}
              />
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#94A3B8] text-sm">All clear! No tasks pending.</p>
            <p className="text-[#4B6080] text-xs mt-1">
              Press Ctrl+K to add a new task
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 group cursor-pointer"
                  style={{
                    borderBottom: "1px solid rgba(75, 142, 255, 0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(75, 142, 255, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "transparent";
                  }}
                >
                  <button
                    onClick={() => handleToggleDone(task.id, task.status)}
                    className="flex-shrink-0 transition-colors duration-200"
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#34D399" }} />
                    ) : (
                      <Circle
                        className="w-5 h-5 transition-colors duration-200"
                        style={{ color: "#94A3B8" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as SVGElement).style.color = "#4B8EFF";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as SVGElement).style.color = "#94A3B8";
                        }}
                      />
                    )}
                  </button>

                  {/* Priority dot */}
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? "#4B6080" }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F1F5F9] truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                          <Clock className="w-3 h-3" />
                          {task.dueDate.split("T")[0]}
                        </span>
                      )}
                      {task.assignee && task.assignee !== "Self" && (
                        <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
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
                        backgroundColor: `${PRIORITY_COLORS[task.priority] ?? "#4B6080"}20`,
                        color: PRIORITY_COLORS[task.priority] ?? "#4B6080",
                      }}
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      className="text-[10px] border-0 hidden sm:inline-flex"
                      style={{
                        backgroundColor: `${DOMAIN_COLORS[task.domain] ?? "#4B8EFF"}18`,
                        color: DOMAIN_COLORS[task.domain] ?? "#4B8EFF",
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
    </div>
  );
}
