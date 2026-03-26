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

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#FF3366",
  P2: "#FFB800",
  P3: "#00D4FF",
  P4: "#8888AA",
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
          <div
            key={i}
            className="h-16 rounded-lg bg-white/[0.03] animate-pulse"
          />
        ))}
      </div>
    );
  }

  const activeTasks = (tasks ?? []).filter((t) => t.status !== "archived");

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[auto_1fr_100px_100px_100px_80px_40px] gap-3 p-3 border-b border-white/[0.06] text-xs font-mono text-[#8888AA] uppercase tracking-wider">
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
        {activeTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: index * 0.02 }}
            className="grid grid-cols-[auto_1fr_100px_100px_100px_80px_40px] gap-3 p-3 items-center border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
          >
            {/* Checkbox */}
            <button onClick={() => handleToggle(task.id, task.status)}>
              {task.status === "done" ? (
                <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
              ) : (
                <Circle className="w-5 h-5 text-[#8888AA] group-hover:text-[#00D4FF]" />
              )}
            </button>

            {/* Title */}
            <div className="min-w-0">
              <p
                className={`text-sm truncate ${
                  task.status === "done"
                    ? "text-[#8888AA] line-through"
                    : "text-[#E8E8F0]"
                }`}
              >
                {task.title}
              </p>
              <div className="flex gap-1 mt-0.5 md:hidden">
                <Badge
                  className="text-[9px] font-mono border-0"
                  style={{
                    backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                    color: PRIORITY_COLORS[task.priority],
                  }}
                >
                  {task.priority}
                </Badge>
              </div>
            </div>

            {/* Priority */}
            <div className="hidden md:block">
              <Badge
                className="text-[10px] font-mono border-0"
                style={{
                  backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                  color: PRIORITY_COLORS[task.priority],
                }}
              >
                {task.priority}
              </Badge>
            </div>

            {/* Status */}
            <div className="hidden md:block">
              <span className="text-xs text-[#8888AA]">
                {STATUS_LABELS[task.status] ?? task.status}
              </span>
            </div>

            {/* Assignee */}
            <div className="hidden md:flex items-center gap-1">
              <User className="w-3 h-3 text-[#8888AA]" />
              <span className="text-xs text-[#8888AA]">
                {task.assignee ?? "Self"}
              </span>
            </div>

            {/* Due Date */}
            <div className="hidden md:flex items-center gap-1">
              {task.dueDate ? (
                <>
                  <Clock className="w-3 h-3 text-[#8888AA]" />
                  <span className="text-xs text-[#8888AA]">
                    {task.dueDate.split("T")[0]?.slice(5)}
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#8888AA]/40">—</span>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4 text-[#8888AA]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#12122A] border-white/[0.06]"
              >
                <DropdownMenuItem className="text-xs text-[#E8E8F0]">
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs text-[#FF3366]"
                  onClick={() => deleteTask.mutate({ id: task.id })}
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))}
      </AnimatePresence>

      {activeTasks.length === 0 && (
        <div className="text-center py-12 text-[#8888AA] text-sm">
          No tasks found. Create one to get started.
        </div>
      )}
    </div>
  );
}
