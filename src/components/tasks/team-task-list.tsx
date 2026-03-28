"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Users, Flag } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Task } from "@/db/schema";

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  P1: { bg: "#FEE2E2", text: "#B91C1C", label: "Critical" },
  P2: { bg: "#FEF3C7", text: "#B45309", label: "High" },
  P3: { bg: "#DBEAFE", text: "#1D4ED8", label: "Medium" },
  P4: { bg: "#F1F5F9", text: "#64748B", label: "Low" },
};

function TaskRow({ task }: { task: Task }) {
  const utils = trpc.useUtils();
  const update = trpc.task.update.useMutation({
    onSuccess: () => utils.task.listShared.invalidate(),
  });

  const isDone = task.status === "done";

  function toggle() {
    update.mutate({
      id: task.id,
      status: isDone ? "todo" : "done",
      completedAt: isDone ? null : new Date().toISOString(),
    });
  }

  const priority = PRIORITY_COLORS[task.priority ?? "P3"] ?? PRIORITY_COLORS.P3!;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group"
      style={{
        background: isDone ? "rgba(15,23,42,0.01)" : "#FFFFFF",
        border: "1px solid rgba(15,23,42,0.05)",
        borderLeft: `3px solid ${isDone ? "rgba(15,23,42,0.08)" : "#F59E0B"}`,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={toggle}
        className="mt-0.5 flex-shrink-0 transition-transform duration-150 hover:scale-110"
      >
        {isDone ? (
          <CheckCircle2 size={17} style={{ color: "#10B981" }} />
        ) : (
          <Circle size={17} style={{ color: "#94A3B8" }} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug"
          style={{
            color: isDone ? "#94A3B8" : "#0F172A",
            textDecoration: isDone ? "line-through" : "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {task.assignee && (
            <span
              className="text-[10px] flex items-center gap-1"
              style={{ color: "#64748B", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              <Users size={10} />
              {task.assignee}
            </span>
          )}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: priority.bg, color: priority.text }}
          >
            {task.priority}
          </span>
          {task.dueDate && (
            <span
              className="text-[10px]"
              style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {new Date(task.dueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TeamTaskList() {
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("P3");
  const [adding, setAdding] = useState(false);
  const { userName } = useAuthStore();

  const { data: tasks = [], isLoading } = trpc.task.listShared.useQuery();
  const utils = trpc.useUtils();
  const createShared = trpc.task.createShared.useMutation({
    onSuccess: () => {
      utils.task.listShared.invalidate();
      setNewTitle("");
      setAdding(false);
    },
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createShared.mutate({
      title: newTitle.trim(),
      priority: newPriority,
      assignee: userName ?? "Team",
    });
  }

  const pending = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#FEF3C7" }}
          >
            <Users size={14} style={{ color: "#B45309" }} />
          </div>
          <div>
            <h3
              className="text-sm font-semibold"
              style={{
                color: "#0F172A",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            >
              Team Tasks
            </h3>
            <p
              className="text-[10px]"
              style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Visible & editable by all team members
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            background: adding ? "#DBEAFE" : "#2563EB",
            color: adding ? "#1D4ED8" : "#FFFFFF",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
        >
          <Plus size={13} />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden"
          >
            <div
              className="p-3 rounded-xl space-y-2"
              style={{ background: "#F8FAFC", border: "1px solid rgba(15,23,42,0.06)" }}
            >
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title..."
                autoFocus
                className="w-full text-sm outline-none bg-transparent"
                style={{
                  color: "#0F172A",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              />
              <div className="flex items-center gap-2">
                <Flag size={12} style={{ color: "#94A3B8" }} />
                {(["P1", "P2", "P3", "P4"] as const).map((p) => {
                  const c = PRIORITY_COLORS[p]!;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className="text-[10px] px-2 py-0.5 rounded-md font-medium transition-all"
                      style={{
                        background: newPriority === p ? c.bg : "transparent",
                        color: newPriority === p ? c.text : "#94A3B8",
                        border: `1px solid ${newPriority === p ? c.bg : "transparent"}`,
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || createShared.isPending}
                  className="text-xs px-3 py-1 rounded-lg font-medium"
                  style={{
                    background: "#2563EB",
                    color: "#FFF",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    opacity: !newTitle.trim() ? 0.5 : 1,
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl animate-pulse"
              style={{ background: "rgba(15,23,42,0.04)" }}
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div
          className="text-center py-12"
          style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          <Users size={28} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
          <p className="text-sm">No team tasks yet.</p>
          <p className="text-xs mt-1">Add a task to share it with your team.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {pending.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </AnimatePresence>

          {done.length > 0 && (
            <>
              <p
                className="text-[10px] uppercase tracking-widest pt-2 pb-1"
                style={{
                  color: "#94A3B8",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                Completed ({done.length})
              </p>
              <AnimatePresence mode="popLayout">
                {done.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </div>
  );
}
