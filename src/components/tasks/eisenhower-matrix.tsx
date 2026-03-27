"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";

const QUADRANTS = [
  {
    id: "Q1",
    priority: "P1",
    label: "Do First",
    sublabel: "Urgent + Important",
    headerColor: "#FF3366",
    bgColor: "rgba(255,51,102,0.05)",
    borderColor: "rgba(255,51,102,0.2)",
  },
  {
    id: "Q2",
    priority: "P2",
    label: "Schedule",
    sublabel: "Not Urgent + Important",
    headerColor: "#00D4FF",
    bgColor: "rgba(0,212,255,0.05)",
    borderColor: "rgba(0,212,255,0.2)",
  },
  {
    id: "Q3",
    priority: "P3",
    label: "Delegate",
    sublabel: "Urgent + Not Important",
    headerColor: "#FFB800",
    bgColor: "rgba(255,184,0,0.05)",
    borderColor: "rgba(255,184,0,0.2)",
  },
  {
    id: "Q4",
    priority: "P4",
    label: "Eliminate",
    sublabel: "Not Urgent + Not Important",
    headerColor: "#8888AA",
    bgColor: "rgba(136,136,170,0.04)",
    borderColor: "rgba(136,136,170,0.15)",
  },
] as const;

type Priority = "P1" | "P2" | "P3" | "P4";

interface EisenhowerMatrixProps {
  search: string;
}

export function EisenhowerMatrix({ search }: EisenhowerMatrixProps) {
  const { data: allTasks, isLoading } = trpc.task.list.useQuery({});
  const utils = trpc.useUtils();

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<string | null>(null);
  const dragPriorityRef = useRef<Priority | null>(null);

  const tasks = (allTasks ?? []).filter(
    (t) =>
      t.status !== "archived" &&
      t.status !== "done" &&
      (search
        ? t.title.toLowerCase().includes(search.toLowerCase())
        : true)
  );

  const getTasksForPriority = (priority: Priority) =>
    tasks.filter((t) => t.priority === priority);

  const handleDragStart = (taskId: string, priority: Priority) => {
    setDraggingId(taskId);
    dragPriorityRef.current = priority;
  };

  const handleDrop = (targetPriority: Priority) => {
    if (!draggingId || !dragPriorityRef.current) return;
    if (dragPriorityRef.current === targetPriority) {
      setDraggingId(null);
      setDragOverQuadrant(null);
      return;
    }
    updateTask.mutate({ id: draggingId, priority: targetPriority });
    setDraggingId(null);
    setDragOverQuadrant(null);
    dragPriorityRef.current = null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-52 rounded-xl bg-white/[0.03] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {QUADRANTS.map((quadrant) => {
        const quadrantTasks = getTasksForPriority(quadrant.priority);
        const isOver = dragOverQuadrant === quadrant.id;

        return (
          <div
            key={quadrant.id}
            className="rounded-xl border transition-colors"
            style={{
              background: isOver
                ? `${quadrant.bgColor.replace("0.05", "0.12")}`
                : quadrant.bgColor,
              borderColor: isOver ? quadrant.headerColor : quadrant.borderColor,
              minHeight: 200,
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverQuadrant(quadrant.id);
            }}
            onDragLeave={() => setDragOverQuadrant(null)}
            onDrop={() => handleDrop(quadrant.priority)}
          >
            {/* Quadrant header */}
            <div
              className="px-3 py-2 border-b rounded-t-xl flex items-center justify-between"
              style={{ borderColor: quadrant.borderColor }}
            >
              <div>
                <span
                  className="text-xs font-mono font-bold uppercase tracking-wider"
                  style={{ color: quadrant.headerColor }}
                >
                  {quadrant.label}
                </span>
                <span className="text-[10px] font-mono text-[#8888AA] ml-2">
                  {quadrant.sublabel}
                </span>
              </div>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${quadrant.headerColor}18`,
                  color: quadrant.headerColor,
                }}
              >
                {quadrant.priority}
              </span>
            </div>

            {/* Tasks */}
            <div className="p-2 space-y-1.5 min-h-[160px]">
              {quadrantTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  draggable
                  onDragStart={() => handleDragStart(task.id, task.priority as Priority)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverQuadrant(null);
                    dragPriorityRef.current = null;
                  }}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{
                    opacity: draggingId === task.id ? 0.4 : 1,
                    scale: draggingId === task.id ? 0.97 : 1,
                  }}
                  className="px-2.5 py-2 rounded-lg border border-white/[0.06] bg-[rgba(26,26,62,0.6)] backdrop-blur-sm cursor-grab active:cursor-grabbing select-none"
                  style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
                >
                  <p className="text-xs text-[#E8E8F0] leading-snug line-clamp-2">
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-[9px] text-[#8888AA] mt-0.5 font-mono">
                      {task.dueDate.split("T")[0]}
                    </p>
                  )}
                </motion.div>
              ))}

              {quadrantTasks.length === 0 && (
                <div className="flex items-center justify-center h-24">
                  <p className="text-[10px] font-mono text-[#8888AA]/40">
                    Drop tasks here
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
