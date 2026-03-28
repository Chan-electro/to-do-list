"use client";

import { trpc } from "@/lib/trpc/client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

const PRIORITY_COLORS: Record<string, { text: string; bg: string }> = {
  P1: { text: "#F87171", bg: "rgba(248, 113, 113, 0.12)" },
  P2: { text: "#FCD34D", bg: "rgba(252, 211, 77, 0.12)" },
  P3: { text: "#4B8EFF", bg: "rgba(75, 142, 255, 0.12)" },
  P4: { text: "#4B6080", bg: "rgba(75, 96, 128, 0.12)" },
};

const COLUMNS = [
  { id: "todo", label: "To Do", color: "#4B8EFF" },
  { id: "in_progress", label: "In Progress", color: "#8B5CF6" },
  { id: "in_review", label: "In Review", color: "#FCD34D" },
  { id: "done", label: "Done", color: "#34D399" },
];

interface TaskKanbanViewProps {
  search: string;
}

export function TaskKanbanView({ search }: TaskKanbanViewProps) {
  const { data: tasks, isLoading } = trpc.task.list.useQuery(
    search ? { search } : {}
  );
  const utils = trpc.useUtils();

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const handleDrop = (taskId: string, newStatus: string) => {
    updateTask.mutate({
      id: taskId,
      status: newStatus,
      completedAt: newStatus === "done" ? new Date().toISOString() : null,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="rounded-xl p-4 min-h-[300px]"
            style={{
              background: "rgba(11, 21, 36, 0.5)",
              border: "1px solid rgba(75, 142, 255, 0.08)",
            }}
          >
            <div
              className="h-6 w-24 rounded animate-pulse"
              style={{ background: "rgba(75, 142, 255, 0.08)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  const allTasks = tasks ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[60vh]">
      {COLUMNS.map((column) => {
        const columnTasks = allTasks.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            className="rounded-xl p-4 transition-all duration-200"
            style={{
              background: "rgba(11, 21, 36, 0.5)",
              border: "1px solid rgba(75, 142, 255, 0.08)",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("taskId");
              if (taskId) handleDrop(taskId, column.id);
            }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3
                  className="text-sm font-mono font-semibold"
                  style={{ color: column.color }}
                >
                  {column.label}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]">
                {columnTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {columnTasks.map((task, index) => {
                const priorityStyle =
                  PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.P4;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    draggable
                    onDragStart={(e) => {
                      // @ts-expect-error - drag event dataTransfer
                      e.dataTransfer?.setData("taskId", task.id);
                    }}
                    className="p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 hover:-translate-y-0.5"
                    style={{
                      background: "#0F1D30",
                      border: "1px solid rgba(75, 142, 255, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "rgba(75, 142, 255, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "rgba(75, 142, 255, 0.1)";
                    }}
                  >
                    <p className="text-sm text-[#F1F5F9] mb-2">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <Badge
                        className="text-[9px] font-mono border-0"
                        style={{
                          backgroundColor: priorityStyle.bg,
                          color: priorityStyle.text,
                        }}
                      >
                        {task.priority}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                            <Clock className="w-3 h-3" />
                            {task.dueDate.split("T")[0]?.slice(5)}
                          </span>
                        )}
                        {task.assignee && task.assignee !== "Self" && (
                          <span className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
