"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Trash2, X, Clock, Edit3, Eye } from "lucide-react";

let ReactMarkdown: React.ComponentType<{ children: string }> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ReactMarkdown = require("react-markdown").default;
} catch {
  ReactMarkdown = null;
}

interface NoteEditorProps {
  noteId: string | null;
  onClose: () => void;
}

export function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: note } = trpc.note.getById.useQuery(
    { id: noteId! },
    { enabled: !!noteId }
  );

  const updateNote = trpc.note.update.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      utils.note.list.invalidate();
      utils.note.getById.invalidate({ id: noteId! });
    },
  });

  const deleteNote = trpc.note.delete.useMutation({
    onSuccess: () => {
      utils.note.list.invalidate();
      onClose();
    },
  });

  // Sync incoming note data to local state
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "");
      setContent(note.contentMd ?? "");
      setLastSaved(null);
    }
  }, [note?.id]);

  // Debounced auto-save on blur via a timer
  const triggerSave = useCallback(() => {
    if (!noteId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateNote.mutate({ id: noteId, title, contentMd: content });
    }, 1000);
  }, [noteId, title, content, updateNote]);

  const handleBlur = () => {
    triggerSave();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Empty state
  if (!noteId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[rgba(26,26,62,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-xl">
        <FileText className="w-16 h-16 text-[#7B2FFF]/20 mb-4" />
        <p className="text-[#8888AA] font-mono text-sm">
          Select a note or create a new one
        </p>
        <p className="text-[#8888AA]/50 text-xs mt-1">
          Your notes will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[rgba(26,26,62,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
        {/* Editable Title */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                handleBlur();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  handleBlur();
                }
              }}
              className="w-full bg-transparent text-lg font-mono font-semibold text-[#E8E8F0] outline-none border-b border-[#00D4FF]/50 pb-0.5"
              placeholder="Note title..."
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="flex items-center gap-2 group"
            >
              <h2 className="text-lg font-mono font-semibold text-[#E8E8F0] truncate">
                {title || "Untitled"}
              </h2>
              <Edit3 className="w-3.5 h-3.5 text-[#8888AA] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {lastSaved && (
            <span className="flex items-center gap-1 text-[10px] text-[#8888AA]/60 font-mono">
              <Clock className="w-3 h-3" />
              Saved{" "}
              {lastSaved.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {updateNote.isPending && (
            <span className="text-[10px] text-[#FFB800] font-mono">
              Saving…
            </span>
          )}

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#FF3366] font-mono">
                Delete?
              </span>
              <button
                onClick={() => deleteNote.mutate({ id: noteId })}
                className="text-xs text-[#FF3366] hover:text-[#FF3366]/80 font-mono border border-[#FF3366]/30 px-2 py-0.5 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-[#8888AA] hover:text-[#E8E8F0] font-mono border border-white/[0.06] px-2 py-0.5 rounded"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md text-[#8888AA] hover:text-[#FF3366] hover:bg-[#FF3366]/10 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8888AA] hover:text-[#E8E8F0] hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="edit" className="flex flex-col flex-1 min-h-0">
        <div className="px-5 pt-2 border-b border-white/[0.06]">
          <TabsList className="bg-white/[0.04] border border-white/[0.06] h-8">
            <TabsTrigger
              value="edit"
              className="text-xs font-mono data-[state=active]:bg-[#7B2FFF]/20 data-[state=active]:text-[#7B2FFF] h-6 px-3"
            >
              <Edit3 className="w-3 h-3 mr-1.5" />
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-xs font-mono data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF] h-6 px-3"
            >
              <Eye className="w-3 h-3 mr-1.5" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Edit Tab */}
        <TabsContent value="edit" className="flex-1 min-h-0 m-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Start writing in markdown…"
            className="w-full h-full p-5 bg-transparent text-sm text-[#E8E8F0] placeholder:text-[#8888AA]/40 font-mono leading-relaxed resize-none outline-none"
            spellCheck={false}
          />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 min-h-0 m-0 overflow-y-auto">
          <div className="p-5">
            {content ? (
              ReactMarkdown ? (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-[#00D4FF] prose-a:text-[#7B2FFF] prose-code:text-[#00FF88] prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-white/[0.06]">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm text-[#E8E8F0] font-mono leading-relaxed whitespace-pre-wrap">
                  {content}
                </pre>
              )
            ) : (
              <p className="text-sm text-[#8888AA]/50 italic">
                Nothing to preview yet. Switch to Edit to start writing.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
