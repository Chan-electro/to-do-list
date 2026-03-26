"use client";

import { trpc } from "@/lib/trpc/client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#FF3366",
  P2: "#FFB800",
  P3: "#00D4FF",
  P4: "#8888AA",
};

const COLUMNS = [
  { id: "todo", label: "To Do", color: "#8888AA" },
  { id: "in_progress", label: "In Progress", color: "#00D4FF" },
  { id: "in_review", label: "In Review", color: "#7B2FFF" },
  { id: "done", label: "Done", color: "#00FF88" },
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
          <div key={col.id} className="glass rounded-xl p-4 min-h-[300px]">
            <div className="h-6 w-24 bg-white/[0.05] rounded animate-pulse" />
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
            className="glass rounded-xl p-4"
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
                <h3 className="text-sm font-mono font-semibold text-[#E8E8F0]">
                  {column.label}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#8888AA]">
                {columnTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {columnTasks.map((task, index) => (
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
                  className="p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors cursor-grab active:cursor-grabbing"
                >
                  <p className="text-sm text-[#E8E8F0] mb-2">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge
                      className="text-[9px] font-mono border-0"
                      style={{
                        backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                        color: PRIORITY_COLORS[task.priority],
                      }}
                    >
                      {task.priority}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-[#8888AA]">
                          <Clock className="w-3 h-3" />
                          {task.dueDate.split("T")[0]?.slice(5)}
                        </span>
                      )}
                      {task.assignee && task.assignee !== "Self" && (
                        <span className="flex items-center gap-1 text-[10px] text-[#8888AA]">
                          <User className="w-3 h-3" />
                          {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
