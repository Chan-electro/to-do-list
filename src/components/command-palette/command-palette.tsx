"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Timer,
  BarChart3,
  StickyNote,
  Settings,
  Plus,
  Search,
  Play,
  Droplets,
} from "lucide-react";

const NAVIGATION_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", keywords: "home mission control" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks", keywords: "todo list kanban" },
  { label: "Habits", icon: Flame, href: "/habits", keywords: "tracker streak" },
  { label: "Timer", icon: Timer, href: "/timer", keywords: "pomodoro stopwatch countdown focus" },
  { label: "Analytics", icon: BarChart3, href: "/analytics", keywords: "charts reports data" },
  { label: "Notes", icon: StickyNote, href: "/notes", keywords: "markdown capture" },
  { label: "Settings", icon: Settings, href: "/settings", keywords: "preferences config" },
];

const QUICK_ACTIONS = [
  { label: "New Task", icon: Plus, action: "new-task", keywords: "create add task" },
  { label: "Start Pomodoro", icon: Play, action: "start-pomodoro", keywords: "focus timer begin" },
  { label: "Log Water", icon: Droplets, action: "log-water", keywords: "habit health drink" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (value: string) => {
    setOpen(false);

    // Navigation
    const navItem = NAVIGATION_ITEMS.find((item) => item.href === value);
    if (navItem) {
      router.push(navItem.href);
      return;
    }

    // Quick Actions
    switch (value) {
      case "new-task":
        router.push("/tasks");
        break;
      case "start-pomodoro":
        router.push("/timer");
        break;
      case "log-water":
        router.push("/habits");
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 max-w-lg overflow-hidden"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.08)",
        }}
      >
        <Command style={{ background: "transparent" }}>
          <div
            className="flex items-center gap-2 px-4"
            style={{ borderBottom: "1px solid rgba(15,23,42,0.07)" }}
          >
            <Search className="w-4 h-4" style={{ color: "#94A3B8" }} />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex-1 py-4 bg-transparent text-sm outline-none"
              style={{ color: "#0F172A", fontFamily: "var(--font-dm-sans), sans-serif" }}
            />
            <kbd
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                color: "#64748B",
                background: "#F1F5F9",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty
              className="text-center text-sm py-6"
              style={{ color: "#94A3B8" }}
            >
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="text-xs px-2 py-1.5 uppercase tracking-widest"
              style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.href}
                    value={item.href}
                    keywords={[item.keywords]}
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
                    style={{ color: "#0F172A", fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#2563EB" }} />
                    {item.label}
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Separator
              className="my-1 h-px"
              style={{ background: "rgba(15,23,42,0.06)" }}
            />

            <Command.Group
              heading="Quick Actions"
              className="text-xs px-2 py-1.5 uppercase tracking-widest"
              style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.action}
                    value={item.action}
                    keywords={[item.keywords]}
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
                    style={{ color: "#0F172A", fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#7C3AED" }} />
                    {item.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          <div
            className="flex items-center justify-between px-4 py-2 text-[10px]"
            style={{
              borderTop: "1px solid rgba(15,23,42,0.06)",
              color: "#94A3B8",
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}
          >
            <span>Navigate with ↑↓ · Select with ↵</span>
            <span>Ctrl+K to toggle</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
