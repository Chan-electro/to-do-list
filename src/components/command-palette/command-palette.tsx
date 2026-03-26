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
      <DialogContent className="p-0 bg-[#12122A] border-white/[0.08] max-w-lg overflow-hidden shadow-2xl shadow-[#00D4FF]/5">
        <Command className="bg-transparent">
          <div className="flex items-center gap-2 px-4 border-b border-white/[0.06]">
            <Search className="w-4 h-4 text-[#8888AA]" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex-1 py-4 bg-transparent text-sm text-[#E8E8F0] placeholder:text-[#8888AA]/50 outline-none"
            />
            <kbd className="text-[10px] font-mono text-[#8888AA] bg-white/[0.05] px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="text-center text-sm text-[#8888AA] py-6">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="text-xs font-mono text-[#8888AA]/60 px-2 py-1.5 uppercase tracking-widest"
            >
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.href}
                    value={item.href}
                    keywords={[item.keywords]}
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E8E8F0] cursor-pointer data-[selected=true]:bg-[#00D4FF]/10 data-[selected=true]:text-[#00D4FF] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-white/[0.04]" />

            <Command.Group
              heading="Quick Actions"
              className="text-xs font-mono text-[#8888AA]/60 px-2 py-1.5 uppercase tracking-widest"
            >
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.action}
                    value={item.action}
                    keywords={[item.keywords]}
                    onSelect={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E8E8F0] cursor-pointer data-[selected=true]:bg-[#00D4FF]/10 data-[selected=true]:text-[#00D4FF] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] text-[10px] font-mono text-[#8888AA]/50">
            <span>Navigate with ↑↓ • Select with ↵</span>
            <span>Ctrl+K to toggle</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
