"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { NoteList } from "@/components/notes/note-list";
import { NoteEditor } from "@/components/notes/note-editor";
import { QuickCaptureModal } from "@/components/notes/quick-capture-modal";
import { trpc } from "@/lib/trpc/client";

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const createNote = trpc.note.create.useMutation({
    onSuccess: (newNote) => {
      utils.note.list.invalidate();
      setSelectedNoteId(newNote.id);
    },
  });

  const handleNewNote = () => {
    createNote.mutate({
      title: "Untitled",
      contentMd: "",
      folder: "inbox",
    });
  };

  const handleClose = () => {
    setSelectedNoteId(null);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full space-y-4 page-enter">
        {/* Page Header */}
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            Notes
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Capture ideas and meeting notes ·{" "}
            <kbd
              className="text-[10px] font-mono rounded px-1 py-0.5"
              style={{
                border: "1px solid rgba(15,23,42,0.12)",
                color: "#64748B",
                background: "#F1F5F9",
              }}
            >
              Ctrl+Space
            </kbd>{" "}
            for quick capture
          </p>
        </div>

        {/* Two-panel layout */}
        <div
          className="flex gap-4 flex-1 min-h-0"
          style={{ height: "calc(100vh - 160px)" }}
        >
          {/* Left panel — Note List (1/3) */}
          <div
            className="w-1/3 min-w-[240px] flex-shrink-0"
            style={{ borderRight: "1px solid rgba(15, 23, 42, 0.06)" }}
          >
            <NoteList
              onSelect={setSelectedNoteId}
              selectedId={selectedNoteId}
              onNew={handleNewNote}
            />
          </div>

          {/* Right panel — Note Editor (2/3) */}
          <div className="flex-1 min-w-0">
            <NoteEditor noteId={selectedNoteId} onClose={handleClose} />
          </div>
        </div>
      </div>

      {/* Global Quick Capture (Ctrl+Space) */}
      <QuickCaptureModal />
    </AppShell>
  );
}
