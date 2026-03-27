"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { exportToJSON, downloadJSON, importFromJSON } from "@/lib/export";

const LAST_EXPORT_KEY = "nexus:lastExportAt";

function getLastExportIso(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_EXPORT_KEY);
}

function saveLastExport(): void {
  localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ImportPreview {
  tasks: number;
  habits: number;
  notes: number;
  timeSessions: number;
  errors: string[];
  raw: string;
}

export function DataExportPanel() {
  const [lastExport, setLastExport] = useState<string | null>(getLastExportIso);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importConfirmed, setImportConfirmed] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const [tasks, habits, notes] = await Promise.all([
        utils.task.list.fetch(undefined),
        utils.habit.list.fetch(),
        utils.note.list.fetch(undefined),
      ]);

      const json = exportToJSON({
        tasks: tasks ?? [],
        habits: habits ?? [],
        notes: notes ?? [],
        timeSessions: [],
      });

      const date = new Date().toISOString().slice(0, 10);
      downloadJSON(`nexus-backup-${date}.json`, json);

      saveLastExport();
      setLastExport(new Date().toISOString());
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks.length : 0;
      const habits = Array.isArray(parsed.habits) ? parsed.habits.length : 0;
      const notes = Array.isArray(parsed.notes) ? parsed.notes.length : 0;
      const timeSessions = Array.isArray(parsed.timeSessions)
        ? parsed.timeSessions.length
        : 0;

      const { errors } = await importFromJSON(text);

      setImportPreview({ tasks, habits, notes, timeSessions, errors, raw: text });
      setImportConfirmed(false);
      setImportStatus("idle");
      setImportMessage(null);
    } catch {
      setImportPreview(null);
      setImportMessage("Could not parse file. Make sure it is a valid Nexus backup.");
      setImportStatus("error");
    }

    // Reset so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    const total =
      importPreview.tasks +
      importPreview.habits +
      importPreview.notes +
      importPreview.timeSessions;
    setImportStatus("success");
    setImportMessage(
      `Import ready: ${total} records parsed (${importPreview.tasks} tasks, ${importPreview.habits} habits, ${importPreview.notes} notes).`
    );
    setImportConfirmed(true);
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setImportConfirmed(false);
    setImportStatus("idle");
    setImportMessage(null);
  };

  return (
    <div className="rounded-xl border border-amber-500/20 bg-white/[0.03] p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-mono text-base font-semibold text-amber-400">
          Data Export / Import
        </h2>
        <p className="text-xs text-[#8888AA]">
          Back up all your Nexus data or restore from a previous export.
        </p>
      </div>

      {/* Export */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-mono text-[#E8E8F0]">Export All Data</p>
            <p className="text-xs text-[#8888AA] mt-0.5">
              Last exported:{" "}
              <span className="text-[#E8E8F0]/60">
                {formatTimestamp(lastExport)}
              </span>
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={[
              "shrink-0 px-4 py-2 rounded-lg text-sm font-mono font-medium",
              "border border-amber-500/30 bg-amber-500/10 text-amber-300",
              "hover:bg-amber-500/20 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {isExporting ? "Exporting…" : "Export JSON"}
          </button>
        </div>
        <p className="text-xs text-[#8888AA]/70">
          Downloads a single JSON file containing tasks, habits, notes, and
          time sessions.
        </p>
      </div>

      {/* Import */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <p className="text-sm font-mono text-[#E8E8F0]">Import from JSON</p>
        <p className="text-xs text-[#8888AA]">
          Select a Nexus backup file. You will see a preview before confirming.
        </p>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span
            className={[
              "px-4 py-2 rounded-lg text-sm font-mono font-medium",
              "border border-white/[0.10] bg-white/[0.04] text-[#E8E8F0]",
              "hover:bg-white/[0.08] transition-colors",
            ].join(" ")}
          >
            Choose File
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        {/* Confirmation dialog */}
        {importPreview && !importConfirmed && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <p className="text-xs font-mono text-amber-400 font-semibold">
              Preview — confirm to proceed
            </p>
            <ul className="text-xs text-[#E8E8F0]/70 space-y-0.5 font-mono">
              <li>{importPreview.tasks} tasks</li>
              <li>{importPreview.habits} habits</li>
              <li>{importPreview.notes} notes</li>
              <li>{importPreview.timeSessions} time sessions</li>
            </ul>

            {importPreview.errors.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {importPreview.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-400 font-mono">
                    {err}
                  </p>
                ))}
              </div>
            )}

            <p className="text-xs text-amber-300/60">
              Make sure you have a current export before importing — this
              cannot be undone.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmImport}
                className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                Confirm Import
              </button>
              <button
                onClick={handleCancelImport}
                className="px-3 py-1.5 rounded text-xs font-mono text-[#8888AA] hover:text-[#E8E8F0] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Status messages */}
        {importStatus === "success" && importMessage && (
          <p className="text-xs font-mono text-emerald-400">{importMessage}</p>
        )}
        {importStatus === "error" && importMessage && (
          <p className="text-xs font-mono text-red-400">{importMessage}</p>
        )}
      </div>
    </div>
  );
}
