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

// P1=red, P2=amber, P3=blue, P4=muted — text always #060B14
const PRIORITY_BG: Record<string, string> = {
  P1: "#F87171",
  P2: "#FCD34D",
  P3: "#4B8EFF",
  P4: "#94A3B8",
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
      <div
        className="glass rounded-2xl p-5 animate-pulse h-[520px]"
        style={{
          background: "rgba(11, 21, 36, 0.75)",
          border: "1px solid rgba(75, 142, 255, 0.12)",
        }}
      />
    );
  }

  return (
    <div
      className="glass rounded-2xl overflow-hidden"
      style={{
        background: "rgba(11, 21, 36, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(75, 142, 255, 0.12)",
      }}
    >
      {/* Calendar Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(75, 142, 255, 0.08)" }}
      >
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg transition-colors text-[#94A3B8] hover:text-[#4B8EFF]"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(75, 142, 255, 0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="text-base font-mono font-semibold text-[#F1F5F9]">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg transition-colors text-[#94A3B8] hover:text-[#4B8EFF]"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(75, 142, 255, 0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Name Headers */}
      <div
        className="grid grid-cols-7 border-b"
        style={{ borderColor: "rgba(75, 142, 255, 0.08)" }}
      >
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] font-mono font-semibold text-[#94A3B8] uppercase tracking-wider"
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
          const isLastRow = idx >= days.length - 7;

          return (
            <div
              key={day.toISOString()}
              className="min-h-[90px] p-2 border-r border-b transition-colors"
              style={{
                borderRightColor: isMonth(idx, 6) ? "transparent" : "rgba(75, 142, 255, 0.05)",
                borderBottomColor: isLastRow ? "transparent" : "rgba(75, 142, 255, 0.05)",
                background: inMonth
                  ? "rgba(75, 142, 255, 0.03)"
                  : "rgba(75, 142, 255, 0.01)",
                opacity: inMonth ? 1 : 0.3,
              }}
            >
              {/* Day Number */}
              <div className="flex items-center justify-end mb-1">
                <span
                  className="text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                  style={
                    todayFlag
                      ? {
                          border: "1px solid #4B8EFF",
                          background: "rgba(75, 142, 255, 0.08)",
                          color: "#4B8EFF",
                          fontWeight: 700,
                        }
                      : {
                          color: inMonth ? "#F1F5F9" : "#94A3B8",
                        }
                  }
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Task Badges */}
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => {
                  const bg = PRIORITY_BG[task.priority] ?? "#94A3B8";
                  return (
                    <button
                      key={task.id}
                      onClick={() =>
                        setSelectedTask(
                          selectedTask?.id === task.id ? null : task
                        )
                      }
                      className="w-full text-left truncate text-[10px] font-mono px-1.5 py-0.5 rounded transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: bg,
                        color: "#060B14",
                        fontSize: "10px",
                      }}
                    >
                      {task.title}
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <span className="text-[9px] text-[#4B6080] font-mono pl-1">
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
        <div
          className="border-t px-5 py-4 flex items-start justify-between gap-4"
          style={{ borderColor: "rgba(75, 142, 255, 0.08)" }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    PRIORITY_BG[selectedTask.priority] ?? "#94A3B8",
                }}
              />
              <p className="text-sm font-mono text-[#F1F5F9] font-medium">
                {selectedTask.title}
              </p>
            </div>
            <div className="flex items-center gap-3 pl-4">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${PRIORITY_BG[selectedTask.priority] ?? "#94A3B8"}20`,
                  color: PRIORITY_BG[selectedTask.priority] ?? "#94A3B8",
                }}
              >
                {selectedTask.priority}
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded text-[#94A3B8]"
                style={{ border: "1px solid rgba(75, 142, 255, 0.1)" }}
              >
                {selectedTask.status}
              </span>
              {selectedTask.dueDate && (
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  Due {format(new Date(selectedTask.dueDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="text-[10px] font-mono text-[#94A3B8] hover:text-[#F1F5F9] px-2 py-1 rounded transition-colors flex-shrink-0"
            style={{ border: "1px solid rgba(75, 142, 255, 0.1)" }}
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
