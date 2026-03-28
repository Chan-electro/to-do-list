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
      <div
        className="flex flex-col items-center justify-center h-full backdrop-blur-xl rounded-xl"
        style={{
          background: "#0B1524",
          border: "1px solid rgba(75,142,255,0.12)",
        }}
      >
        <FileText className="w-16 h-16 mb-4" style={{ color: "rgba(75,142,255,0.2)" }} />
        <p className="text-[#94A3B8] font-mono text-sm">
          Select a note or create a new one
        </p>
        <p className="text-[#4B6080] text-xs mt-1">
          Your notes will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full backdrop-blur-xl rounded-xl overflow-hidden"
      style={{
        background: "#0B1524",
        border: "1px solid rgba(75,142,255,0.12)",
      }}
    >
      {/* Editor Header */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ borderBottom: "1px solid rgba(75,142,255,0.1)" }}
      >
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
              className="w-full bg-transparent text-xl font-semibold text-[#F1F5F9] outline-none pb-0.5 transition-colors duration-200"
              style={{
                borderBottom: "1px solid #4B8EFF",
              }}
              placeholder="Note title..."
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="flex items-center gap-2 group"
            >
              <h2 className="text-xl font-semibold text-[#F1F5F9] truncate">
                {title || "Untitled"}
              </h2>
              <Edit3 className="w-3.5 h-3.5 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {lastSaved && (
            <span className="flex items-center gap-1 text-[10px] text-[#34D399] font-mono">
              <Clock className="w-3 h-3" />
              Saved{" "}
              {lastSaved.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {updateNote.isPending && (
            <span className="text-[10px] text-[#94A3B8] font-mono">
              Saving…
            </span>
          )}

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#F87171] font-mono">
                Delete?
              </span>
              <button
                onClick={() => deleteNote.mutate({ id: noteId })}
                className="text-xs text-[#F87171] font-mono px-2 py-0.5 rounded transition-colors duration-200"
                style={{ border: "1px solid rgba(248,113,113,0.3)" }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] font-mono px-2 py-0.5 rounded transition-colors duration-200"
                style={{ border: "1px solid rgba(75,142,255,0.12)" }}
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md text-[#F87171] transition-colors duration-200"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(248,113,113,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-200"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(75,142,255,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="edit" className="flex flex-col flex-1 min-h-0">
        <div
          className="px-5 pt-2"
          style={{ borderBottom: "1px solid rgba(75,142,255,0.1)" }}
        >
          <TabsList
            className="h-8"
            style={{
              background: "rgba(75,142,255,0.04)",
              border: "1px solid rgba(75,142,255,0.1)",
            }}
          >
            <TabsTrigger
              value="edit"
              className="text-xs font-mono h-6 px-3 text-[#94A3B8] data-[state=active]:text-[#4B8EFF] transition-colors duration-200"
              style={
                {
                  "--tw-data-active-bg": "rgba(75,142,255,0.12)",
                } as React.CSSProperties
              }
            >
              <Edit3 className="w-3 h-3 mr-1.5" />
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-xs font-mono h-6 px-3 text-[#94A3B8] data-[state=active]:text-[#4B8EFF] transition-colors duration-200"
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
            className="w-full h-full p-5 bg-transparent text-sm text-[#F1F5F9] placeholder:text-[#4B6080] font-mono leading-relaxed resize-none outline-none"
            spellCheck={false}
          />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 min-h-0 m-0 overflow-y-auto">
          <div className="p-5">
            {content ? (
              ReactMarkdown ? (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-[#F1F5F9] prose-strong:text-[#93C5FD] prose-a:text-[#4B8EFF] prose-code:text-[#34D399] prose-pre:bg-[rgba(75,142,255,0.04)] prose-pre:border prose-pre:border-[rgba(75,142,255,0.12)]">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm text-[#F1F5F9] font-mono leading-relaxed whitespace-pre-wrap">
                  {content}
                </pre>
              )
            ) : (
              <p className="text-sm text-[#4B6080] italic">
                Nothing to preview yet. Switch to Edit to start writing.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
