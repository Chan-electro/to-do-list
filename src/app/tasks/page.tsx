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
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: "var(--font-playfair), serif",
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              Tasks
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>
              Manage your mission objectives
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-48 text-sm transition-all duration-200"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  color: "#0F172A",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#2563EB";
                  (e.currentTarget as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(15,23,42,0.12)";
                  (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                }}
              />
            </div>

            {/* View Toggle */}
            <div
              className="flex items-center rounded-lg p-1"
              style={{
                background: "#F1F5F9",
                border: "1px solid rgba(15, 23, 42, 0.08)",
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
                    background: view === mode ? "#FFFFFF" : "transparent",
                    color: view === mode ? "#2563EB" : "#94A3B8",
                    boxShadow: view === mode ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
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
              style={{ background: "#2563EB", color: "#FFFFFF" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#1D4ED8";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
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
