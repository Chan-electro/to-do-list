"use client";

import { useState } from "react";
import { Dumbbell, BookOpen, Brain, Droplets, Phone, Heart, Star, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HabitCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_SWATCHES = [
  { label: "Blue", value: "#4B8EFF" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Green", value: "#34D399" },
  { label: "Amber", value: "#FCD34D" },
  { label: "Red", value: "#F87171" },
  { label: "Pink", value: "#FF6FD8" },
];

const ICON_OPTIONS: { value: string; label: string; node: React.ReactNode }[] = [
  { value: "dumbbell", label: "Dumbbell", node: <Dumbbell className="w-4 h-4" /> },
  { value: "book-open", label: "Book", node: <BookOpen className="w-4 h-4" /> },
  { value: "brain", label: "Brain", node: <Brain className="w-4 h-4" /> },
  { value: "droplets", label: "Droplets", node: <Droplets className="w-4 h-4" /> },
  { value: "phone", label: "Phone", node: <Phone className="w-4 h-4" /> },
  { value: "heart", label: "Heart", node: <Heart className="w-4 h-4" /> },
  { value: "star", label: "Star", node: <Star className="w-4 h-4" /> },
  { value: "zap", label: "Zap", node: <Zap className="w-4 h-4" /> },
];

const CATEGORY_OPTIONS = [
  { value: "health", label: "Health" },
  { value: "learning", label: "Learning" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "professional", label: "Professional" },
  { value: "finance", label: "Finance" },
  { value: "custom", label: "Custom" },
];

const DEFAULT_STATE = {
  name: "",
  category: "health",
  targetValue: "",
  unit: "",
  color: "#4B8EFF",
  icon: "star",
};

export function HabitCreateDialog({ open, onOpenChange }: HabitCreateDialogProps) {
  const [form, setForm] = useState(DEFAULT_STATE);

  const utils = trpc.useUtils();

  const createHabit = trpc.habit.create.useMutation({
    onSuccess: () => {
      utils.habit.list.invalidate();
      utils.habit.getStreaks.invalidate();
      setForm(DEFAULT_STATE);
      onOpenChange(false);
    },
  });

  function handleChange<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createHabit.mutate({
      name: form.name.trim(),
      category: form.category,
      targetValue: form.targetValue ? Number(form.targetValue) : undefined,
      unit: form.unit || undefined,
      color: form.color,
      icon: form.icon,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="text-[#F1F5F9] max-w-lg"
        style={{
          background: "#0B1524",
          border: "1px solid rgba(75,142,255,0.15)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-[#4B8EFF]">New Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input
            placeholder="Habit name..."
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="text-[#F1F5F9] placeholder:text-[#4B6080]"
            style={{
              background: "rgba(75,142,255,0.05)",
              border: "1px solid rgba(75,142,255,0.15)",
            }}
            autoFocus
          />

          {/* Category + Icon row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">Category</label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger
                  style={{
                    background: "rgba(75,142,255,0.05)",
                    border: "1px solid rgba(75,142,255,0.15)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "#0B1524",
                    border: "1px solid rgba(75,142,255,0.15)",
                  }}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">Icon</label>
              <Select value={form.icon} onValueChange={(v) => handleChange("icon", v)}>
                <SelectTrigger
                  style={{
                    background: "rgba(75,142,255,0.05)",
                    border: "1px solid rgba(75,142,255,0.15)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "#0B1524",
                    border: "1px solid rgba(75,142,255,0.15)",
                  }}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.node}
                        <span>{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target value + Unit row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">Target Value</label>
              <Input
                type="number"
                placeholder="1"
                min={1}
                value={form.targetValue}
                onChange={(e) => handleChange("targetValue", e.target.value)}
                className="text-[#F1F5F9]"
                style={{
                  background: "rgba(75,142,255,0.05)",
                  border: "1px solid rgba(75,142,255,0.15)",
                }}
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">Unit</label>
              <Input
                placeholder="times, mins, pages..."
                value={form.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className="text-[#F1F5F9] placeholder:text-[#4B6080]"
                style={{
                  background: "rgba(75,142,255,0.05)",
                  border: "1px solid rgba(75,142,255,0.15)",
                }}
              />
            </div>
          </div>

          {/* Color swatches */}
          <div>
            <label className="text-xs text-[#94A3B8] mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => handleChange("color", swatch.value)}
                  className="w-7 h-7 rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none active:scale-[0.97]"
                  style={{
                    background: swatch.value,
                    boxShadow:
                      form.color === swatch.value
                        ? `0 0 0 2px #0B1524, 0 0 0 4px ${swatch.value}`
                        : "none",
                    transform: form.color === swatch.value ? "scale(1.15)" : "scale(1)",
                  }}
                  title={swatch.label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.name.trim() || createHabit.isPending}
              className="font-medium active:scale-[0.97] transition-all duration-200"
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
              {createHabit.isPending ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
