"use client";

import { trpc } from "@/lib/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  User,
  MoreHorizontal,
  Trash2,
  Edit2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIORITY_COLORS: Record<string, { text: string; bg: string }> = {
  P1: { text: "#B91C1C", bg: "#FEE2E2" },
  P2: { text: "#B45309", bg: "#FEF3C7" },
  P3: { text: "#1D4ED8", bg: "#DBEAFE" },
  P4: { text: "#64748B", bg: "#F1F5F9" },
};

const STATUS_LABELS: Record<string, string> = {
  inbox: "Inbox",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  blocked: "Blocked",
  done: "Done",
  archived: "Archived",
};

interface TaskListViewProps {
  search: string;
}

export function TaskListView({ search }: TaskListViewProps) {
  const { data: tasks, isLoading } = trpc.task.list.useQuery(
    search ? { search } : {}
  );
  const utils = trpc.useUtils();

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const handleToggle = (taskId: string, currentStatus: string) => {
    updateTask.mutate({
      id: taskId,
      status: currentStatus === "done" ? "todo" : "done",
      completedAt: currentStatus === "done" ? null : new Date().toISOString(),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  const activeTasks = (tasks ?? []).filter((t) => t.status !== "archived");

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div
        className="grid grid-cols-[auto_1fr_100px_100px_100px_80px_40px] gap-3 p-3 text-xs uppercase tracking-wider font-semibold"
        style={{
          color: "#94A3B8",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          fontFamily: "var(--font-dm-sans), sans-serif",
        }}
      >
        <div className="w-6" />
        <div>Title</div>
        <div className="hidden md:block">Priority</div>
        <div className="hidden md:block">Status</div>
        <div className="hidden md:block">Assignee</div>
        <div className="hidden md:block">Due</div>
        <div />
      </div>

      {/* Task Rows */}
      <AnimatePresence>
        {activeTasks.map((task, index) => {
          const priorityStyle = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.P4;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.02 }}
              className="grid grid-cols-[auto_1fr_100px_100px_100px_80px_40px] gap-3 p-3 items-center transition-all duration-200 group"
              style={{ borderBottom: "1px solid rgba(15, 23, 42, 0.04)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(37, 99, 235, 0.025)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {/* Checkbox */}
              <button onClick={() => handleToggle(task.id, task.status)}>
                {task.status === "done" ? (
                  <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />
                ) : (
                  <Circle
                    className="w-5 h-5 transition-colors duration-200 group-hover:text-[#2563EB]"
                    style={{ color: "#CBD5E1" }}
                  />
                )}
              </button>

              {/* Title */}
              <div className="min-w-0">
                <p
                  className={`text-sm truncate ${task.status === "done" ? "line-through" : ""}`}
                  style={{
                    color: task.status === "done" ? "#94A3B8" : "#0F172A",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}
                >
                  {task.title}
                </p>
                <div className="flex gap-1 mt-0.5 md:hidden">
                  <Badge
                    className="text-[9px] border-0 font-medium"
                    style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>

              {/* Priority */}
              <div className="hidden md:block">
                <Badge
                  className="text-[10px] border-0 font-medium"
                  style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
                >
                  {task.priority}
                </Badge>
              </div>

              {/* Status */}
              <div className="hidden md:block">
                <span className="text-xs" style={{ color: "#64748B" }}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </span>
              </div>

              {/* Assignee */}
              <div className="hidden md:flex items-center gap-1">
                <User className="w-3 h-3" style={{ color: "#94A3B8" }} />
                <span className="text-xs" style={{ color: "#64748B" }}>
                  {task.assignee ?? "Self"}
                </span>
              </div>

              {/* Due Date */}
              <div className="hidden md:flex items-center gap-1">
                {task.dueDate ? (
                  <>
                    <Clock className="w-3 h-3" style={{ color: "#94A3B8" }} />
                    <span className="text-xs" style={{ color: "#64748B" }}>
                      {task.dueDate.split("T")[0]?.slice(5)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs" style={{ color: "#CBD5E1" }}>—</span>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" style={{ color: "#94A3B8" }} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    boxShadow: "0 4px 20px rgba(15,23,42,0.1)",
                  }}
                >
                  <DropdownMenuItem className="text-xs" style={{ color: "#0F172A" }}>
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs"
                    style={{ color: "#EF4444" }}
                    onClick={() => deleteTask.mutate({ id: task.id })}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {activeTasks.length === 0 && (
        <div
          className="text-center py-12 text-sm"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          No tasks found. Create one to get started.
        </div>
      )}
    </div>
  );
}
