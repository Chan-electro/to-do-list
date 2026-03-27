"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { Zap, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function QuickCaptureModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [toast, setToast] = useState(false);

  const utils = trpc.useUtils();

  const createNote = trpc.note.create.useMutation({
    onSuccess: () => {
      utils.note.list.invalidate();
      setTitle("");
      setContent("");
      setOpen(false);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    },
  });

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setOpen(false);
    setTitle("");
    setContent("");
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim() && !content.trim()) return;
    createNote.mutate({
      title: title.trim() || "Quick Capture",
      contentMd: content,
      folder: "inbox",
    });
  }, [title, content, createNote]);

  // Global Ctrl+Space listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  // Keyboard submit inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <>
      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-sm font-mono transition-all duration-300 ${
          toast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <Zap className="w-4 h-4" />
        Saved to Inbox
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-[#0A0A1A]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* Modal */}
          <div className="w-full max-w-lg bg-[rgba(26,26,62,0.95)] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-[#7B2FFF]/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#7B2FFF]" />
                <span className="text-sm font-mono font-semibold text-[#E8E8F0]">
                  Quick Capture
                </span>
                <span className="text-[10px] font-mono text-[#8888AA]/60 border border-white/[0.06] px-1.5 py-0.5 rounded">
                  inbox
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md text-[#8888AA] hover:text-[#E8E8F0] hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-3" onKeyDown={handleKeyDown}>
              <Input
                autoFocus
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/[0.04] border-white/[0.06] text-[#E8E8F0] placeholder:text-[#8888AA]/50 font-mono text-sm focus:border-[#7B2FFF]/50"
              />

              <textarea
                placeholder="Start writing… (Ctrl+Enter to save)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-[#E8E8F0] placeholder:text-[#8888AA]/50 font-mono leading-relaxed resize-none outline-none focus:border-[#7B2FFF]/50 transition-colors"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#8888AA]/50 font-mono">
                  Ctrl+Enter to save · Esc to close
                </span>
                <button
                  onClick={handleSave}
                  disabled={
                    createNote.isPending ||
                    (!title.trim() && !content.trim())
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7B2FFF] hover:bg-[#7B2FFF]/80 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-mono transition-colors"
                >
                  {createNote.isPending ? "Saving…" : "Save to Inbox"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
