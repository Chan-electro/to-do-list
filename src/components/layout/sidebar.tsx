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
        background: "#0F172A",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-16 px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <span
            className="text-lg font-bold tracking-widest flex-shrink-0"
            style={{
              color: "#60A5FA",
              fontFamily: "var(--font-playfair), Georgia, serif",
              letterSpacing: "0.12em",
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
                className="text-lg font-bold tracking-widest whitespace-nowrap"
                style={{
                  color: "#60A5FA",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  letterSpacing: "0.12em",
                }}
              >
                EXUS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden px-2">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-all duration-200 group relative overflow-hidden"
              style={{
                background: isActive
                  ? "rgba(96, 165, 250, 0.12)"
                  : "transparent",
                color: isActive ? "#93C5FD" : "rgba(241, 245, 249, 0.55)",
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "#60A5FA" }}
                />
              )}

              {/* Hover background */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                style={{ background: "rgba(255, 255, 255, 0.04)" }}
              />

              <Icon
                size={17}
                className="flex-shrink-0 relative z-10"
                style={{
                  color: isActive ? "#60A5FA" : "rgba(241, 245, 249, 0.5)",
                }}
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
                    style={{
                      color: isActive ? "#E2E8F0" : "rgba(241, 245, 249, 0.55)",
                      fontFamily: "var(--font-dm-sans), sans-serif",
                    }}
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
              style={{ color: "#FCD34D", opacity: 0.8 }}
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
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center justify-center w-full rounded-lg py-2 px-2 transition-all duration-200 group"
          style={{ color: "rgba(241, 245, 249, 0.3)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className="flex items-center gap-2 group-hover:opacity-100 transition-opacity duration-200"
            style={{ opacity: 0.7 }}
          >
            {collapsed ? (
              <ChevronsRight size={16} />
            ) : (
              <>
                <ChevronsLeft size={16} className="flex-shrink-0" />
                <AnimatePresence initial={false}>
                  <motion.span
                    key="collapse-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs whitespace-nowrap"
                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
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
