"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { parseTaskInput } from "@/lib/nl-parser";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "bg-red-500/20 text-red-300 border-red-500/30",
  P2: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  P3: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  P4: "bg-[#8888AA]/20 text-[#8888AA] border-[#8888AA]/30",
};

function formatDuePreview(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const hasTime = iso.includes("T") && iso.length > 10;
  const options: Intl.DateTimeFormatOptions = hasTime
    ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

interface NLQuickAddProps {
  onCreated?: () => void;
}

export function NLQuickAdd({ onCreated }: NLQuickAddProps) {
  const [input, setInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const parsed = input.trim() ? parseTaskInput(input) : null;

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      utils.dashboard.getSummary.invalidate();
      setInput("");
      setConfirmed(false);
      setError(null);
      onCreated?.();
    },
    onError: (err) => {
      setError(err.message);
      setConfirmed(false);
    },
  });

  const handleCreate = useCallback(() => {
    if (!parsed || !parsed.title) return;
    createTask.mutate({
      title: parsed.title,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      assignee: parsed.assignee,
      domain: parsed.domain,
      estimatedMinutes: parsed.estimatedMinutes,
    });
  }, [parsed, createTask]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setInput("");
      setConfirmed(false);
      setError(null);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (!parsed?.title) return;

      if (!confirmed) {
        setConfirmed(true);
      } else {
        handleCreate();
      }
    }
  };

  const hasParsedContent =
    parsed &&
    (parsed.priority !== "P3" ||
      parsed.dueDate !== undefined ||
      parsed.assignee !== "Self" ||
      parsed.estimatedMinutes !== undefined);

  return (
    <div className="w-full space-y-2">
      {/* Input bar */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setConfirmed(false);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Quick add: 'Review campaign P1 tomorrow' or just type and press Enter"
          className={[
            "w-full px-4 py-3 rounded-lg font-mono text-sm",
            "bg-white/[0.04] text-[#E8E8F0] placeholder:text-[#8888AA]/50",
            "border transition-colors duration-150 outline-none",
            confirmed
              ? "border-[#7B2FFF]/70 shadow-[0_0_0_1px_rgba(123,47,255,0.3)]"
              : "border-white/[0.08] focus:border-[#00D4FF]/60 focus:shadow-[0_0_0_1px_rgba(0,212,255,0.15)]",
          ].join(" ")}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Inline Create button — visible once confirmed */}
        {confirmed && parsed?.title && (
          <button
            onClick={handleCreate}
            disabled={createTask.isPending}
            className={[
              "absolute right-2 top-1/2 -translate-y-1/2",
              "px-3 py-1 rounded text-xs font-mono font-semibold",
              "bg-[#7B2FFF] hover:bg-[#7B2FFF]/80 text-white",
              "transition-colors disabled:opacity-50",
            ].join(" ")}
          >
            {createTask.isPending ? "Creating…" : "Create ↵"}
          </button>
        )}
      </div>

      {/* Live preview badges */}
      {input.trim() && parsed && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {/* Title preview */}
          {parsed.title && (
            <span className="text-xs text-[#E8E8F0]/70 font-mono truncate max-w-[200px]">
              "{parsed.title}"
            </span>
          )}

          {/* Priority badge */}
          <span
            className={[
              "px-2 py-0.5 rounded-full text-xs font-mono border",
              PRIORITY_COLORS[parsed.priority] ?? PRIORITY_COLORS["P3"],
            ].join(" ")}
          >
            {parsed.priority}
          </span>

          {/* Due date badge */}
          {parsed.dueDate && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono border bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20">
              {formatDuePreview(parsed.dueDate)}
            </span>
          )}

          {/* Assignee badge */}
          {parsed.assignee && parsed.assignee !== "Self" && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono border bg-[#7B2FFF]/10 text-[#7B2FFF]/90 border-[#7B2FFF]/20">
              @{parsed.assignee}
            </span>
          )}

          {/* Estimated time badge */}
          {parsed.estimatedMinutes !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono border bg-white/[0.05] text-[#8888AA] border-white/[0.08]">
              ~{parsed.estimatedMinutes}m
            </span>
          )}

          {/* Domain badge */}
          <span className="px-2 py-0.5 rounded-full text-xs font-mono border bg-white/[0.04] text-[#8888AA]/70 border-white/[0.06]">
            {parsed.domain}
          </span>

          {/* Confirmation hint */}
          {!confirmed && hasParsedContent && (
            <span className="text-xs text-[#8888AA]/50 font-mono ml-auto">
              ↵ to confirm
            </span>
          )}
          {confirmed && (
            <span className="text-xs text-[#7B2FFF]/80 font-mono ml-auto">
              ↵ again or click Create
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 font-mono px-1">{error}</p>
      )}
    </div>
  );
}
