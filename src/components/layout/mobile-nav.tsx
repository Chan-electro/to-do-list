"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Flame, Timer, MoreHorizontal } from "lucide-react";

const tabs = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Habits", icon: Flame, href: "/habits" },
  { label: "Timer", icon: Timer, href: "/timer" },
  { label: "More", icon: MoreHorizontal, href: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch backdrop-blur-xl"
      style={{
        background: "rgba(8, 14, 26, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(75, 142, 255, 0.1)",
        height: "64px",
      }}
    >
      {tabs.map(({ label, icon: Icon, href }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200"
            style={{
              color: isActive ? "#4B8EFF" : "rgba(255,255,255,0.35)",
            }}
          >
            <Icon
              size={20}
              style={
                isActive
                  ? {
                      color: "#4B8EFF",
                      filter: "drop-shadow(0 0 6px rgba(75, 142, 255, 0.6))",
                    }
                  : {}
              }
            />
            <span
              className="text-[10px] font-medium tracking-wide"
              style={
                isActive
                  ? {
                      color: "#4B8EFF",
                      textShadow: "0 0 6px rgba(75, 142, 255, 0.4)",
                    }
                  : {}
              }
            >
              {label}
            </span>

            {/* Active indicator dot */}
            {isActive && (
              <span
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{
                  background: "#4B8EFF",
                  boxShadow: "0 0 6px rgba(75, 142, 255, 0.8)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
