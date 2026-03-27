"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#FF3366",
  P2: "#FFB800",
  P3: "#00D4FF",
  P4: "#8888AA",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface TaskCalendarViewProps {
  search: string;
}

interface TaskDetail {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string | null;
}

export function TaskCalendarView({ search }: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

  const { data: allTasks, isLoading } = trpc.task.list.useQuery({});

  // Filter tasks by search and those that have a dueDate
  const tasks: TaskDetail[] = (allTasks ?? []).filter((t) => {
    if (!t.dueDate) return false;
    if (search) {
      return t.title.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // Calendar grid days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const prevMonth = () => {
    setCurrentMonth((d) => {
      const nd = new Date(d);
      nd.setMonth(d.getMonth() - 1);
      return nd;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((d) => {
      const nd = new Date(d);
      nd.setMonth(d.getMonth() + 1);
      return nd;
    });
  };

  const getTasksForDay = (day: Date): TaskDetail[] => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      return isSameDay(new Date(t.dueDate), day);
    });
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse h-[520px]" />
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg text-[#8888AA] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="text-base font-mono font-semibold text-[#E8E8F0]">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg text-[#8888AA] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Name Headers */}
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] font-mono font-semibold text-[#8888AA] uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayTasks = getTasksForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const todayFlag = isToday(day);
          const isLast = idx === days.length - 1;
          const isLastRow = idx >= days.length - 7;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[90px] p-2 border-r border-b border-white/[0.04] transition-colors ${
                !isMonth(idx, 6) ? "" : "border-r-0"
              } ${isLastRow ? "border-b-0" : ""} ${
                inMonth ? "bg-transparent" : "bg-white/[0.01]"
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-end mb-1">
                <span
                  className={`text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                    todayFlag
                      ? "bg-transparent ring-2 ring-[#00D4FF] text-[#00D4FF] font-bold"
                      : inMonth
                      ? "text-[#E8E8F0]"
                      : "text-[#8888AA]/30"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Task Badges */}
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() =>
                      setSelectedTask(
                        selectedTask?.id === task.id ? null : task
                      )
                    }
                    className="w-full text-left truncate text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[task.priority] ?? "#8888AA"}22`,
                      color: PRIORITY_COLORS[task.priority] ?? "#8888AA",
                      borderLeft: `2px solid ${PRIORITY_COLORS[task.priority] ?? "#8888AA"}`,
                    }}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[9px] text-[#8888AA]/60 font-mono pl-1">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Task Detail */}
      {selectedTask && (
        <div className="border-t border-white/[0.06] px-5 py-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    PRIORITY_COLORS[selectedTask.priority] ?? "#8888AA",
                }}
              />
              <p className="text-sm font-mono text-[#E8E8F0] font-medium">
                {selectedTask.title}
              </p>
            </div>
            <div className="flex items-center gap-3 pl-4">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${PRIORITY_COLORS[selectedTask.priority] ?? "#8888AA"}20`,
                  color: PRIORITY_COLORS[selectedTask.priority] ?? "#8888AA",
                }}
              >
                {selectedTask.priority}
              </span>
              <span className="text-[10px] font-mono text-[#8888AA] border border-white/[0.06] px-2 py-0.5 rounded">
                {selectedTask.status}
              </span>
              {selectedTask.dueDate && (
                <span className="text-[10px] font-mono text-[#8888AA]">
                  Due {format(new Date(selectedTask.dueDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="text-[10px] font-mono text-[#8888AA] hover:text-[#E8E8F0] border border-white/[0.06] px-2 py-1 rounded transition-colors flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// Helper: check if index is last in row (col 6, 13, etc.)
function isMonth(idx: number, col: number): boolean {
  return idx % 7 === col;
}
