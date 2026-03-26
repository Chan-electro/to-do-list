"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskKanbanView } from "@/components/tasks/task-kanban-view";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { Button } from "@/components/ui/button";
import { LayoutList, Kanban, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type ViewMode = "list" | "kanban";

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-mono font-bold">
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] bg-clip-text text-transparent">
                Tasks
              </span>
            </h1>
            <p className="text-sm text-[#8888AA] mt-1">
              Manage your mission objectives
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888AA]" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-48 bg-white/[0.05] border-white/[0.06] text-sm"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center glass rounded-lg p-1">
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-md transition-colors ${
                  view === "list"
                    ? "bg-[#00D4FF]/20 text-[#00D4FF]"
                    : "text-[#8888AA] hover:text-[#E8E8F0]"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`p-2 rounded-md transition-colors ${
                  view === "kanban"
                    ? "bg-[#00D4FF]/20 text-[#00D4FF]"
                    : "text-[#8888AA] hover:text-[#E8E8F0]"
                }`}
              >
                <Kanban className="w-4 h-4" />
              </button>
            </div>

            {/* Add Task */}
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A0A1A] font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>

        {/* View Content */}
        {view === "list" ? (
          <TaskListView search={search} />
        ) : (
          <TaskKanbanView search={search} />
        )}

        <TaskCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    </AppShell>
  );
}
