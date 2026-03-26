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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-white/10"
      style={{
        background: "rgba(18, 18, 42, 0.90)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
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
              color: isActive ? "#00D4FF" : "rgba(255,255,255,0.45)",
            }}
          >
            <Icon
              size={20}
              style={
                isActive
                  ? {
                      color: "#00D4FF",
                      filter: "drop-shadow(0 0 6px rgba(0, 212, 255, 0.7))",
                    }
                  : {}
              }
            />
            <span
              className="text-[10px] font-medium tracking-wide"
              style={
                isActive
                  ? {
                      color: "#00D4FF",
                      textShadow: "0 0 6px rgba(0, 212, 255, 0.6)",
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
                  background: "#00D4FF",
                  boxShadow: "0 0 6px rgba(0, 212, 255, 0.9)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
