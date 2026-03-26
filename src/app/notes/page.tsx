"use client";

import { AppShell } from "@/components/layout/app-shell";
import { StickyNote } from "lucide-react";

export default function NotesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-mono font-bold">
            <span className="bg-gradient-to-r from-[#7B2FFF] to-[#00D4FF] bg-clip-text text-transparent">
              Notes
            </span>
          </h1>
          <p className="text-sm text-[#8888AA] mt-1">
            Capture ideas and meeting notes
          </p>
        </div>

        <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <StickyNote className="w-12 h-12 text-[#7B2FFF]/30 mb-4" />
          <p className="text-lg font-mono text-[#8888AA]">
            Notes Module coming in Phase 2
          </p>
          <p className="text-sm text-[#8888AA]/60 mt-1">
            Markdown editor with full-text search
          </p>
        </div>
      </div>
    </AppShell>
  );
}
