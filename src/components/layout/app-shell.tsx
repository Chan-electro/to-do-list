"use client";

import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#FAFAFA" }}
    >
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6"
          style={{ minHeight: "100vh" }}
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <MobileNav />
    </div>
  );
}
