"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HabitHeatmapProps {
  habitId: string;
  habitName: string;
}

function buildDayGrid(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getMonthLabels(days: string[]): { label: string; colIndex: number }[] {
  const labels: { label: string; colIndex: number }[] = [];
  let lastMonth = "";
  days.forEach((day, idx) => {
    const month = new Date(day).toLocaleString("default", { month: "short" });
    const col = Math.floor(idx / 10);
    if (month !== lastMonth) {
      lastMonth = month;
      if (!labels.find((l) => l.colIndex === col)) {
        labels.push({ label: month, colIndex: col });
      }
    }
  });
  return labels;
}

export function HabitHeatmap({ habitId, habitName }: HabitHeatmapProps) {
  const { data: logs, isLoading } = trpc.habit.getHeatmap.useQuery({ habitId });

  const days = buildDayGrid();
  const monthLabels = getMonthLabels(days);

  const completedSet = new Set(
    (logs ?? []).filter((l) => l.completed).map((l) => l.date)
  );

  const ROWS = 10;
  const COLS = 9;

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(11,21,36,0.75)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(75,142,255,0.12)",
        }}
      >
        <p className="font-mono text-xs mb-3 text-[#94A3B8]">
          {habitName}
        </p>
        <div
          className="h-24 rounded-lg animate-pulse"
          style={{ background: "rgba(75,142,255,0.04)" }}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(11,21,36,0.75)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(75,142,255,0.12)",
        }}
      >
        <p className="font-mono text-xs font-medium mb-3 text-[#F1F5F9]">
          {habitName}
        </p>

        {/* Month labels row */}
        <div
          className="grid mb-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gap: "3px" }}
        >
          {Array.from({ length: COLS }).map((_, colIdx) => {
            const label = monthLabels.find((m) => m.colIndex === colIdx);
            return (
              <div
                key={colIdx}
                className="font-mono text-[9px] text-center text-[#94A3B8]"
              >
                {label ? label.label : ""}
              </div>
            );
          })}
        </div>

        {/* Heatmap grid: ROWS rows, COLS columns */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gap: "3px" }}
        >
          {Array.from({ length: COLS }).map((_, colIdx) =>
            Array.from({ length: ROWS }).map((_, rowIdx) => {
              const dayIdx = colIdx * ROWS + rowIdx;
              const day = days[dayIdx];
              if (!day) {
                return (
                  <div
                    key={`${colIdx}-${rowIdx}`}
                    className="rounded-sm aspect-square"
                    style={{ background: "transparent" }}
                  />
                );
              }
              const completed = completedSet.has(day);
              const isToday = day === new Date().toISOString().slice(0, 10);
              const formattedDate = new Date(day).toLocaleDateString("default", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <Tooltip key={`${colIdx}-${rowIdx}`}>
                  <TooltipTrigger asChild>
                    <div
                      className="rounded-sm aspect-square cursor-default transition-opacity hover:opacity-80"
                      style={{
                        background: completed
                          ? "rgba(75, 142, 255, 0.7)"
                          : "rgba(75,142,255,0.04)",
                        outline: isToday ? "1px solid #4B8EFF" : "none",
                        outlineOffset: "1px",
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    className="font-mono text-xs"
                    style={{
                      background: "#0B1524",
                      border: "1px solid rgba(75,142,255,0.15)",
                      color: "#F1F5F9",
                    }}
                  >
                    <span>{formattedDate}</span>
                    <span
                      className="ml-2"
                      style={{ color: completed ? "#34D399" : "#94A3B8" }}
                    >
                      {completed ? "Completed" : "Not done"}
                    </span>
                  </TooltipContent>
                </Tooltip>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3">
          <span className="font-mono text-[10px] text-[#94A3B8]">Less</span>
          {[0.04, 0.25, 0.5, 0.7, 1].map((opacity, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                background:
                  i === 0
                    ? "rgba(75,142,255,0.04)"
                    : `rgba(75,142,255,${opacity})`,
              }}
            />
          ))}
          <span className="font-mono text-[10px] text-[#94A3B8]">More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
