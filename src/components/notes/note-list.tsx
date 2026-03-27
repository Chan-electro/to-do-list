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
    <div className="flex flex-col h-full bg-[rgba(26,26,62,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-semibold text-[#E8E8F0] uppercase tracking-wider">
            Notes
          </h2>
          <button
            onClick={onNew}
            className="flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#7B2FFF]/20 text-[#7B2FFF] hover:bg-[#7B2FFF]/30 border border-[#7B2FFF]/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8888AA]" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm bg-white/[0.04] border-white/[0.06] placeholder:text-[#8888AA]/60 text-[#E8E8F0] h-8"
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
                className="h-16 rounded-lg bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && (!notes || notes.length === 0) && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <FileText className="w-8 h-8 text-[#7B2FFF]/30 mb-2" />
            <p className="text-sm text-[#8888AA]">
              {search ? "No notes match your search" : "No notes yet"}
            </p>
            {!search && (
              <p className="text-xs text-[#8888AA]/60 mt-1">
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
                className={`w-full text-left px-4 py-3 border-b border-white/[0.04] transition-colors relative group ${
                  isActive
                    ? "bg-[#7B2FFF]/10"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#00D4FF] rounded-r" />
                )}

                <div className="space-y-1 pl-2">
                  <p
                    className={`text-sm font-medium truncate ${
                      isActive ? "text-[#00D4FF]" : "text-[#E8E8F0]"
                    }`}
                  >
                    {note.title || "Untitled"}
                  </p>

                  {preview && (
                    <p className="text-xs text-[#8888AA] truncate leading-relaxed">
                      {preview}
                      {note.contentMd && note.contentMd.length > 60 ? "…" : ""}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {note.folder && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#7B2FFF]/15 text-[#7B2FFF]/80 border border-[#7B2FFF]/20">
                        <FolderOpen className="w-2.5 h-2.5" />
                        {note.folder}
                      </span>
                    )}
                    {note.updatedAt && (
                      <span className="text-[10px] text-[#8888AA]/60">
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
