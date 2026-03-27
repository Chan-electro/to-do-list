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
  { label: "Cyan", value: "#00D4FF" },
  { label: "Violet", value: "#7B2FFF" },
  { label: "Green", value: "#00FF88" },
  { label: "Amber", value: "#FFB800" },
  { label: "Red", value: "#FF3366" },
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
  color: "#00D4FF",
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
      <DialogContent className="bg-[#12122A] border-white/[0.06] text-[#E8E8F0] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#00D4FF]">New Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input
            placeholder="Habit name..."
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="bg-white/[0.05] border-white/[0.06] text-[#E8E8F0] placeholder:text-[#8888AA]/50"
            autoFocus
          />

          {/* Category + Icon row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">Category</label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger className="bg-white/[0.05] border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12122A] border-white/[0.06]">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">Icon</label>
              <Select value={form.icon} onValueChange={(v) => handleChange("icon", v)}>
                <SelectTrigger className="bg-white/[0.05] border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12122A] border-white/[0.06]">
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
              <label className="text-xs text-[#8888AA] mb-1 block">Target Value</label>
              <Input
                type="number"
                placeholder="1"
                min={1}
                value={form.targetValue}
                onChange={(e) => handleChange("targetValue", e.target.value)}
                className="bg-white/[0.05] border-white/[0.06] text-[#E8E8F0]"
              />
            </div>
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">Unit</label>
              <Input
                placeholder="times, mins, pages..."
                value={form.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className="bg-white/[0.05] border-white/[0.06] text-[#E8E8F0] placeholder:text-[#8888AA]/50"
              />
            </div>
          </div>

          {/* Color swatches */}
          <div>
            <label className="text-xs text-[#8888AA] mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => handleChange("color", swatch.value)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    background: swatch.value,
                    boxShadow:
                      form.color === swatch.value
                        ? `0 0 0 2px #0A0A1A, 0 0 0 4px ${swatch.value}`
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
              className="text-[#8888AA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.name.trim() || createHabit.isPending}
              className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A0A1A] font-medium"
            >
              {createHabit.isPending ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
