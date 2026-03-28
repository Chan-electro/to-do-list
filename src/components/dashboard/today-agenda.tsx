"use client";

import { trpc } from "@/lib/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const PRIORITY_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  P1: { dot: "#EF4444", bg: "#FEE2E2", text: "#B91C1C" },
  P2: { dot: "#F59E0B", bg: "#FEF3C7", text: "#B45309" },
  P3: { dot: "#2563EB", bg: "#DBEAFE", text: "#1D4ED8" },
  P4: { dot: "#94A3B8", bg: "#F1F5F9", text: "#64748B" },
};

const DOMAIN_COLORS: Record<string, { bg: string; text: string }> = {
  personal:      { bg: "#D1FAE5", text: "#059669" },
  professional:  { bg: "#DBEAFE", text: "#1D4ED8" },
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
        style={{ borderBottom: "1px solid rgba(15, 23, 42, 0.06)" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "#0F172A", fontFamily: "var(--font-playfair), serif" }}
        >
          Today&apos;s Agenda
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="text-xs"
            style={{ color: "#64748B", fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            {todayTasks.length} tasks
          </span>
          <Link
            href="/tasks"
            className="text-xs font-medium transition-colors duration-200 hover:underline"
            style={{ color: "#2563EB" }}
          >
            View all
          </Link>
        </div>
      </div>

      <div className="px-5 py-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl skeleton" />
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: "#64748B" }}>All clear! No tasks pending.</p>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              Press Ctrl+K to add a new task
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {todayTasks.map((task, index) => {
                const priorityStyle = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.P4;
                const domainStyle = DOMAIN_COLORS[task.domain] ?? { bg: "#DBEAFE", text: "#1D4ED8" };
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 group cursor-pointer"
                    style={{ borderBottom: "1px solid rgba(15, 23, 42, 0.04)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(37, 99, 235, 0.03)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <button
                      onClick={() => handleToggleDone(task.id, task.status)}
                      className="flex-shrink-0 transition-colors duration-200"
                    >
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />
                      ) : (
                        <Circle
                          className="w-5 h-5 transition-colors duration-200"
                          style={{ color: "#CBD5E1" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as SVGElement).style.color = "#2563EB";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as SVGElement).style.color = "#CBD5E1";
                          }}
                        />
                      )}
                    </button>

                    {/* Priority dot */}
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: priorityStyle.dot }}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm truncate"
                        style={{
                          color: "#0F172A",
                          fontFamily: "var(--font-dm-sans), sans-serif",
                          textDecoration: task.status === "done" ? "line-through" : "none",
                          opacity: task.status === "done" ? 0.5 : 1,
                        }}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                            <Clock className="w-3 h-3" />
                            {task.dueDate.split("T")[0]}
                          </span>
                        )}
                        {task.assignee && task.assignee !== "Self" && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        className="text-[10px] font-medium border-0 px-2"
                        style={{
                          backgroundColor: priorityStyle.bg,
                          color: priorityStyle.text,
                        }}
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        className="text-[10px] border-0 hidden sm:inline-flex px-2"
                        style={{
                          backgroundColor: domainStyle.bg,
                          color: domainStyle.text,
                        }}
                      >
                        {task.domain}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
