"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { userName } = useAuthStore();
  const router = useRouter();

  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full rounded-lg px-2 py-2 transition-all duration-200"
        style={{
          background: open ? "rgba(96,165,250,0.1)" : "transparent",
        }}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold"
          style={{
            background: "linear-gradient(135deg, #2563EB, #60A5FA)",
            color: "#fff",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
        >
          {initials}
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="user-label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center justify-between overflow-hidden"
            >
              <span
                className="text-xs truncate"
                style={{
                  color: "rgba(241,245,249,0.75)",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                {userName ?? "User"}
              </span>
              <ChevronDown
                size={12}
                style={{
                  color: "rgba(241,245,249,0.4)",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden z-50"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* User info header */}
            <div
              className="px-3 py-2.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2">
                <User size={13} style={{ color: "#60A5FA" }} />
                <span
                  className="text-xs font-medium"
                  style={{
                    color: "#E2E8F0",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}
                >
                  {userName}
                </span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-left transition-colors duration-150"
              style={{ color: "#F87171" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(239,68,68,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              <LogOut size={13} />
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Sign Out
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
