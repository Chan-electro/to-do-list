"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Search, Plus, FileText, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

interface NoteListProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
  onNew: () => void;
}

export function NoteList({ onSelect, selectedId, onNew }: NoteListProps) {
  const [search, setSearch] = useState("");

  const { data: notes, isLoading } = trpc.note.list.useQuery(
    search ? { search } : {}
  );

  return (
    <div
      className="flex flex-col h-full backdrop-blur-xl rounded-xl overflow-hidden"
      style={{
        background: "rgba(11,21,36,0.75)",
        border: "1px solid rgba(75,142,255,0.12)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 space-y-3"
        style={{ borderBottom: "1px solid rgba(75,142,255,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-semibold text-[#F1F5F9] uppercase tracking-wider">
            Notes
          </h2>
          <button
            onClick={onNew}
            className="flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "#4B8EFF",
              color: "#060B14",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#5B9EFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#4B8EFF";
            }}
          >
            <Plus className="w-3 h-3" />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm placeholder:text-[#4B6080] text-[#F1F5F9] h-8 focus:border-[#4B8EFF] transition-colors duration-200"
            style={{
              background: "rgba(75,142,255,0.05)",
              border: "1px solid rgba(75,142,255,0.12)",
            }}
          />
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-1 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg animate-pulse"
                style={{ background: "rgba(75,142,255,0.04)" }}
              />
            ))}
          </div>
        )}

        {!isLoading && (!notes || notes.length === 0) && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <FileText className="w-8 h-8 mb-2" style={{ color: "rgba(75,142,255,0.3)" }} />
            <p className="text-sm text-[#94A3B8]">
              {search ? "No notes match your search" : "No notes yet"}
            </p>
            {!search && (
              <p className="text-xs text-[#4B6080] mt-1">
                Click "New Note" to get started
              </p>
            )}
          </div>
        )}

        {!isLoading &&
          notes?.map((note) => {
            const isActive = selectedId === note.id;
            const preview = note.contentMd
              ? note.contentMd.replace(/[#*`_~\[\]()]/g, "").slice(0, 60)
              : "";

            return (
              <button
                key={note.id}
                onClick={() => onSelect(note.id)}
                className="w-full text-left px-4 py-3 transition-all duration-200 relative group"
                style={{
                  background: isActive ? "#0F1D30" : "transparent",
                  borderBottom: "1px solid rgba(75,142,255,0.06)",
                  borderLeft: isActive ? "2px solid #4B8EFF" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderLeftColor =
                      "rgba(75,142,255,0.25)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderLeftColor =
                      "transparent";
                  }
                }}
              >
                <div className="space-y-1 pl-2">
                  <p className="text-sm font-medium truncate text-[#F1F5F9]">
                    {note.title || "Untitled"}
                  </p>

                  {preview && (
                    <p className="text-xs text-[#94A3B8] truncate leading-relaxed">
                      {preview}
                      {note.contentMd && note.contentMd.length > 60 ? "…" : ""}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {note.folder && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(75,142,255,0.12)",
                          color: "#4B8EFF",
                        }}
                      >
                        <FolderOpen className="w-2.5 h-2.5" />
                        {note.folder}
                      </span>
                    )}
                    {note.updatedAt && (
                      <span className="text-[10px] text-[#4B6080]">
                        {formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
