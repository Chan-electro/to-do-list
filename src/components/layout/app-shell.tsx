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
      style={{ background: "#060B14" }}
    >
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      {/*
        On desktop the sidebar is fixed-positioned, so we push the content
        right with a left margin that matches the sidebar's expanded width (256px).
        The sidebar manages its own collapsed state; we use a CSS variable or
        simply rely on the sidebar's motion width to handle the offset.
        A simpler approach: use pl that covers the max sidebar width.
      */}
      <main
        className="flex-1 flex flex-col overflow-hidden md:ml-64"
      >
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
