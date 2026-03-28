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
    headerColor: "#F87171",
    bgColor: "rgba(248, 113, 113, 0.04)",
    borderColor: "rgba(248, 113, 113, 0.15)",
    borderHover: "rgba(248, 113, 113, 0.35)",
  },
  {
    id: "Q2",
    priority: "P2",
    label: "Schedule",
    sublabel: "Not Urgent + Important",
    headerColor: "#4B8EFF",
    bgColor: "rgba(75, 142, 255, 0.04)",
    borderColor: "rgba(75, 142, 255, 0.15)",
    borderHover: "rgba(75, 142, 255, 0.35)",
  },
  {
    id: "Q3",
    priority: "P3",
    label: "Delegate",
    sublabel: "Urgent + Not Important",
    headerColor: "#FCD34D",
    bgColor: "rgba(252, 211, 77, 0.04)",
    borderColor: "rgba(252, 211, 77, 0.15)",
    borderHover: "rgba(252, 211, 77, 0.35)",
  },
  {
    id: "Q4",
    priority: "P4",
    label: "Eliminate",
    sublabel: "Not Urgent + Not Important",
    headerColor: "#4B6080",
    bgColor: "rgba(75, 96, 128, 0.04)",
    borderColor: "rgba(75, 96, 128, 0.15)",
    borderHover: "rgba(75, 96, 128, 0.35)",
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
            className="h-52 rounded-xl animate-pulse"
            style={{ background: "rgba(75, 142, 255, 0.03)" }}
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
                ? quadrant.bgColor.replace("0.04", "0.10")
                : quadrant.bgColor,
              borderColor: isOver ? quadrant.borderHover : quadrant.borderColor,
              borderStyle: isOver ? "dashed" : "solid",
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
                <span className="text-[10px] font-mono text-[#94A3B8] ml-2">
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
                  className="px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none"
                  style={{
                    background: "#0F1D30",
                    border: "1px solid rgba(75, 142, 255, 0.1)",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <p className="text-xs text-[#F1F5F9] leading-snug line-clamp-2">
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-[9px] text-[#94A3B8] mt-0.5 font-mono">
                      {task.dueDate.split("T")[0]}
                    </p>
                  )}
                </motion.div>
              ))}

              {quadrantTasks.length === 0 && (
                <div className="flex items-center justify-center h-24">
                  <p className="text-[10px] font-mono text-[#4B6080]">
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
