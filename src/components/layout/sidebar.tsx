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
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{
        background: "rgba(8, 14, 26, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(75, 142, 255, 0.1)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-16 px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(75, 142, 255, 0.08)" }}
      >
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <span
            className="text-lg font-bold tracking-widest font-mono flex-shrink-0"
            style={{
              color: "#4B8EFF",
              textShadow: "0 0 16px rgba(75, 142, 255, 0.5)",
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
                  color: "#4B8EFF",
                  textShadow: "0 0 16px rgba(75, 142, 255, 0.5)",
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
                  ? "2px solid #4B8EFF"
                  : "2px solid transparent",
                background: isActive
                  ? "rgba(75, 142, 255, 0.08)"
                  : "transparent",
                color: isActive ? "#4B8EFF" : "rgba(255,255,255,0.6)",
              }}
            >
              {/* Hover background */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"
                style={{ background: "rgba(75, 142, 255, 0.05)" }}
              />

              <Icon
                size={18}
                className="flex-shrink-0 relative z-10"
                style={
                  isActive
                    ? {
                        color: "#4B8EFF",
                        filter: "drop-shadow(0 0 6px rgba(75, 142, 255, 0.6))",
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
                            color: "#4B8EFF",
                            textShadow: "0 0 8px rgba(75, 142, 255, 0.4)",
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
              style={{ color: "#FCD34D", filter: "drop-shadow(0 0 5px rgba(252, 211, 77, 0.5))" }}
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
      <div
        className="flex-shrink-0 p-2"
        style={{ borderTop: "1px solid rgba(75, 142, 255, 0.08)" }}
      >
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center justify-center w-full rounded-md py-2 px-2 transition-all duration-200 group"
          style={{ color: "rgba(255,255,255,0.35)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className="flex items-center gap-2 group-hover:opacity-100 transition-opacity duration-200"
            style={{ opacity: 0.6 }}
          >
            {collapsed ? (
              <ChevronsRight
                size={18}
                className="transition-colors duration-200"
                style={{ color: "inherit" }}
              />
            ) : (
              <>
                <ChevronsLeft
                  size={18}
                  className="transition-colors duration-200 flex-shrink-0"
                  style={{ color: "inherit" }}
                />
                <AnimatePresence initial={false}>
                  <motion.span
                    key="collapse-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs whitespace-nowrap transition-colors duration-200"
                    style={{ color: "inherit" }}
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
