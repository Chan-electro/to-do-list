"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { parseTaskInput } from "@/lib/nl-parser";

const PRIORITY_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  P1: { bg: "rgba(248,113,113,0.12)", text: "#F87171", border: "rgba(248,113,113,0.25)" },
  P2: { bg: "rgba(252,211,77,0.12)", text: "#FCD34D", border: "rgba(252,211,77,0.25)" },
  P3: { bg: "rgba(75,142,255,0.10)", text: "#4B8EFF", border: "rgba(75,142,255,0.2)" },
  P4: { bg: "rgba(75,96,128,0.12)", text: "#94A3B8", border: "rgba(75,96,128,0.2)" },
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

  const priorityStyle = parsed?.priority
    ? (PRIORITY_BADGE[parsed.priority] ?? PRIORITY_BADGE["P3"])
    : PRIORITY_BADGE["P3"];

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
          className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none transition-colors duration-200"
          style={{
            background: "rgba(75, 142, 255, 0.04)",
            border: confirmed
              ? "1px solid rgba(139, 92, 246, 0.5)"
              : "1px solid rgba(75, 142, 255, 0.15)",
            color: "#F1F5F9",
          }}
          onFocus={(e) => {
            if (!confirmed) {
              e.currentTarget.style.borderColor = "#4B8EFF";
            }
          }}
          onBlur={(e) => {
            if (!confirmed) {
              e.currentTarget.style.borderColor = "rgba(75, 142, 255, 0.15)";
            }
          }}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Inline Create button — visible once confirmed */}
        {confirmed && parsed?.title && (
          <button
            onClick={handleCreate}
            disabled={createTask.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-50"
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
            {createTask.isPending ? "Creating…" : "Create ↵"}
          </button>
        )}
      </div>

      {/* Live preview badges */}
      {input.trim() && parsed && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {/* Title preview */}
          {parsed.title && (
            <span className="text-xs text-[#F1F5F9]/70 font-mono truncate max-w-[200px]">
              "{parsed.title}"
            </span>
          )}

          {/* Priority badge */}
          <span
            className="px-2 py-0.5 rounded-full text-xs font-mono border"
            style={{
              background: priorityStyle.bg,
              color: priorityStyle.text,
              borderColor: priorityStyle.border,
            }}
          >
            {parsed.priority}
          </span>

          {/* Due date badge */}
          {parsed.dueDate && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-mono border"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                color: "#8B5CF6",
                borderColor: "rgba(139, 92, 246, 0.2)",
              }}
            >
              {formatDuePreview(parsed.dueDate)}
            </span>
          )}

          {/* Assignee badge */}
          {parsed.assignee && parsed.assignee !== "Self" && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-mono border"
              style={{
                background: "rgba(52, 211, 153, 0.08)",
                color: "#34D399",
                borderColor: "rgba(52, 211, 153, 0.18)",
              }}
            >
              @{parsed.assignee}
            </span>
          )}

          {/* Estimated time badge */}
          {parsed.estimatedMinutes !== undefined && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-mono border"
              style={{
                background: "rgba(75, 142, 255, 0.05)",
                color: "#94A3B8",
                borderColor: "rgba(75, 142, 255, 0.1)",
              }}
            >
              ~{parsed.estimatedMinutes}m
            </span>
          )}

          {/* Domain badge */}
          <span
            className="px-2 py-0.5 rounded-full text-xs font-mono border"
            style={{
              background: "rgba(75, 96, 128, 0.08)",
              color: "#4B6080",
              borderColor: "rgba(75, 96, 128, 0.12)",
            }}
          >
            {parsed.domain}
          </span>

          {/* Confirmation hint */}
          {!confirmed && hasParsedContent && (
            <span className="text-xs text-[#4B6080] font-mono ml-auto">
              ↵ to confirm
            </span>
          )}
          {confirmed && (
            <span className="text-xs text-[#8B5CF6]/80 font-mono ml-auto">
              ↵ again or click Create
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-[#F87171] font-mono px-1">{error}</p>
      )}
    </div>
  );
}
