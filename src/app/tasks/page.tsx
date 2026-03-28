"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskKanbanView } from "@/components/tasks/task-kanban-view";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { EisenhowerMatrix } from "@/components/tasks/eisenhower-matrix";
import { FocusOverlay } from "@/components/focus-mode/focus-overlay";
import { useFocusStore } from "@/stores/focus-store";
import { Button } from "@/components/ui/button";
import { LayoutList, Kanban, CalendarDays, Plus, Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TaskCalendarView } from "@/components/tasks/task-calendar-view";

type ViewMode = "list" | "kanban" | "calendar" | "matrix";

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { isActive, taskId, taskTitle } = useFocusStore();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-mono font-bold">
              <span className="bg-gradient-to-r from-[#4B8EFF] to-[#8B5CF6] bg-clip-text text-transparent">
                Tasks
              </span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              Manage your mission objectives
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-48 text-sm placeholder:text-[#4B6080] transition-all duration-200"
                style={{
                  background: "rgba(75, 142, 255, 0.05)",
                  border: "1px solid rgba(75, 142, 255, 0.15)",
                  color: "#F1F5F9",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#4B8EFF";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor =
                    "rgba(75, 142, 255, 0.15)";
                }}
              />
            </div>

            {/* View Toggle */}
            <div
              className="flex items-center rounded-lg p-1"
              style={{
                background: "rgba(11, 21, 36, 0.8)",
                border: "1px solid rgba(75, 142, 255, 0.12)",
              }}
            >
              {(
                [
                  { mode: "list", Icon: LayoutList, title: "List" },
                  { mode: "kanban", Icon: Kanban, title: "Kanban" },
                  { mode: "calendar", Icon: CalendarDays, title: "Calendar" },
                  { mode: "matrix", Icon: LayoutGrid, title: "Eisenhower Matrix" },
                ] as const
              ).map(({ mode, Icon, title }) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  title={title}
                  className="p-2 rounded-md transition-all duration-200"
                  style={{
                    background:
                      view === mode ? "rgba(75, 142, 255, 0.15)" : "transparent",
                    color: view === mode ? "#4B8EFF" : "#94A3B8",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Add Task */}
            <Button
              onClick={() => setCreateOpen(true)}
              className="font-medium transition-all duration-150 active:scale-[0.96]"
              style={{ background: "#4B8EFF", color: "#060B14" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#5B9EFF";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#4B8EFF";
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>

        {/* View Content */}
        {view === "list" && <TaskListView search={search} />}
        {view === "kanban" && <TaskKanbanView search={search} />}
        {view === "calendar" && <TaskCalendarView search={search} />}
        {view === "matrix" && <EisenhowerMatrix search={search} />}

        <TaskCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>

      {/* Focus Mode Overlay */}
      {isActive && taskId && (
        <FocusOverlay taskTitle={taskTitle} taskId={taskId} />
      )}
    </AppShell>
  );
}
