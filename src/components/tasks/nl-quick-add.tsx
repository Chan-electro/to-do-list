"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { parseTaskInput } from "@/lib/nl-parser";

const PRIORITY_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  P1: { bg: "#FEE2E2", text: "#B91C1C", border: "rgba(239,68,68,0.25)" },
  P2: { bg: "#FEF3C7", text: "#B45309", border: "rgba(245,158,11,0.25)" },
  P3: { bg: "#DBEAFE", text: "#1D4ED8", border: "rgba(37,99,235,0.2)" },
  P4: { bg: "#F1F5F9", text: "#64748B", border: "rgba(15,23,42,0.12)" },
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
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
          style={{
            background: "#FFFFFF",
            border: confirmed
              ? "1px solid rgba(124,58,237,0.4)"
              : "1px solid rgba(15, 23, 42, 0.12)",
            color: "#0F172A",
            fontFamily: "var(--font-dm-sans), sans-serif",
            boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
          }}
          onFocus={(e) => {
            if (!confirmed) {
              e.currentTarget.style.borderColor = "#2563EB";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
            }
          }}
          onBlur={(e) => {
            if (!confirmed) {
              e.currentTarget.style.borderColor = "rgba(15,23,42,0.12)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.04)";
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
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{
              background: "#2563EB",
              color: "#FFFFFF",
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
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
            <span className="text-xs truncate max-w-[200px]" style={{ color: "#475569" }}>
              &ldquo;{parsed.title}&rdquo;
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
              className="px-2 py-0.5 rounded-full text-xs border"
              style={{
                background: "#EDE9FE",
                color: "#6D28D9",
                borderColor: "rgba(109,40,217,0.2)",
              }}
            >
              {formatDuePreview(parsed.dueDate)}
            </span>
          )}

          {/* Assignee badge */}
          {parsed.assignee && parsed.assignee !== "Self" && (
            <span
              className="px-2 py-0.5 rounded-full text-xs border"
              style={{
                background: "#D1FAE5",
                color: "#065F46",
                borderColor: "rgba(16,185,129,0.2)",
              }}
            >
              @{parsed.assignee}
            </span>
          )}

          {/* Estimated time badge */}
          {parsed.estimatedMinutes !== undefined && (
            <span
              className="px-2 py-0.5 rounded-full text-xs border"
              style={{
                background: "#F1F5F9",
                color: "#64748B",
                borderColor: "rgba(15,23,42,0.1)",
              }}
            >
              ~{parsed.estimatedMinutes}m
            </span>
          )}

          {/* Domain badge */}
          <span
            className="px-2 py-0.5 rounded-full text-xs border"
            style={{
              background: "#F1F5F9",
              color: "#475569",
              borderColor: "rgba(15,23,42,0.08)",
            }}
          >
            {parsed.domain}
          </span>

          {/* Confirmation hint */}
          {!confirmed && hasParsedContent && (
            <span className="text-xs ml-auto" style={{ color: "#94A3B8" }}>
              ↵ to confirm
            </span>
          )}
          {confirmed && (
            <span className="text-xs ml-auto" style={{ color: "#7C3AED" }}>
              ↵ again or click Create
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs px-1" style={{ color: "#EF4444" }}>{error}</p>
      )}
    </div>
  );
}
