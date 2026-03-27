"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Timer,
  BarChart3,
  StickyNote,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Trophy,
} from "lucide-react";
import { XpDisplay } from "@/components/gamification/xp-display";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Habits", icon: Flame, href: "/habits" },
  { label: "Timer", icon: Timer, href: "/timer" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden border-r border-white/10"
      style={{
        background: "rgba(18, 18, 42, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <span
            className="text-lg font-bold tracking-widest font-mono flex-shrink-0"
            style={{
              color: "#00D4FF",
              textShadow: "0 0 12px rgba(0, 212, 255, 0.8)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            N
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="nexus-label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold tracking-widest font-mono whitespace-nowrap"
                style={{
                  color: "#00D4FF",
                  textShadow: "0 0 12px rgba(0, 212, 255, 0.8)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                EXUS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden px-2">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-all duration-200 group relative overflow-hidden"
              style={{
                borderLeft: isActive
                  ? "2px solid #00D4FF"
                  : "2px solid transparent",
                background: isActive
                  ? "rgba(0, 212, 255, 0.08)"
                  : "transparent",
                color: isActive ? "#00D4FF" : "rgba(255,255,255,0.6)",
              }}
            >
              {/* Hover background */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"
                style={{ background: "rgba(0, 212, 255, 0.05)" }}
              />

              <Icon
                size={18}
                className="flex-shrink-0 relative z-10"
                style={
                  isActive
                    ? {
                        color: "#00D4FF",
                        filter: "drop-shadow(0 0 6px rgba(0, 212, 255, 0.7))",
                      }
                    : { color: "rgba(255,255,255,0.6)" }
                }
              />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key={`label-${href}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap relative z-10"
                    style={
                      isActive
                        ? {
                            color: "#00D4FF",
                            textShadow: "0 0 8px rgba(0, 212, 255, 0.6)",
                          }
                        : {}
                    }
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* XP Display */}
      <div className="flex-shrink-0 px-2 pb-1">
        {collapsed ? (
          <div className="flex justify-center py-2">
            <Trophy
              size={16}
              style={{ color: "#FFB800", filter: "drop-shadow(0 0 5px rgba(255,184,0,0.6))" }}
            />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <motion.div
              key="xp-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <XpDisplay />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="flex-shrink-0 p-2 border-t border-white/10">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center justify-center w-full rounded-md py-2 px-2 transition-all duration-200 group"
          style={{ color: "rgba(255,255,255,0.4)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className="flex items-center gap-2 group-hover:opacity-100 transition-opacity duration-200"
            style={{ opacity: 0.6 }}
          >
            {collapsed ? (
              <ChevronsRight
                size={18}
                className="group-hover:text-cyan-400 transition-colors duration-200"
              />
            ) : (
              <>
                <ChevronsLeft
                  size={18}
                  className="group-hover:text-cyan-400 transition-colors duration-200 flex-shrink-0"
                />
                <AnimatePresence initial={false}>
                  <motion.span
                    key="collapse-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs whitespace-nowrap group-hover:text-cyan-400 transition-colors duration-200"
                  >
                    Collapse
                  </motion.span>
                </AnimatePresence>
              </>
            )}
          </span>
        </button>
      </div>
    </motion.aside>
  );
}
