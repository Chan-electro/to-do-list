"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskCreateDialog({ open, onOpenChange }: TaskCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("P3");
  const [domain, setDomain] = useState("personal");
  const [assignee, setAssignee] = useState("Self");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  const utils = trpc.useUtils();

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      utils.dashboard.getSummary.invalidate();
      resetForm();
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("P3");
    setDomain("personal");
    setAssignee("Self");
    setDueDate("");
    setEstimatedMinutes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate({
      title: title.trim(),
      description,
      priority,
      domain,
      assignee,
      dueDate: dueDate || undefined,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
    });
  };

  const inputStyle = {
    background: "rgba(75, 142, 255, 0.05)",
    border: "1px solid rgba(75, 142, 255, 0.15)",
    color: "#F1F5F9",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        style={{
          background: "#0B1524",
          border: "1px solid rgba(75, 142, 255, 0.15)",
          color: "#F1F5F9",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono">
            <span
              className="bg-gradient-to-r from-[#4B8EFF] to-[#8B5CF6] bg-clip-text text-transparent"
            >
              New Task
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="placeholder:text-[#4B6080]"
            style={inputStyle}
            autoFocus
          />

          <Textarea
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="placeholder:text-[#4B6080] min-h-[80px]"
            style={inputStyle}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "#0F1D30",
                    border: "1px solid rgba(75, 142, 255, 0.12)",
                  }}
                >
                  <SelectItem value="P1">
                    <span className="text-[#F87171]">P1</span> - Critical
                  </SelectItem>
                  <SelectItem value="P2">
                    <span className="text-[#FCD34D]">P2</span> - High
                  </SelectItem>
                  <SelectItem value="P3">
                    <span className="text-[#4B8EFF]">P3</span> - Medium
                  </SelectItem>
                  <SelectItem value="P4">
                    <span className="text-[#4B6080]">P4</span> - Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">
                Domain
              </label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "#0F1D30",
                    border: "1px solid rgba(75, 142, 255, 0.12)",
                  }}
                >
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">
                Assignee
              </label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "#0F1D30",
                    border: "1px solid rgba(75, 142, 255, 0.12)",
                  }}
                >
                  <SelectItem value="Self">Self</SelectItem>
                  <SelectItem value="Maneesh">Maneesh</SelectItem>
                  <SelectItem value="Ashish">Ashish</SelectItem>
                  <SelectItem value="Likitesh">Likitesh</SelectItem>
                  <SelectItem value="Sumeeth">Sumeeth</SelectItem>
                  <SelectItem value="Chandu">Chandu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">
                Est. Minutes
              </label>
              <Input
                type="number"
                placeholder="60"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#94A3B8] mb-1 block">
              Due Date
            </label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>

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
              disabled={!title.trim() || createTask.isPending}
              className="font-medium transition-all duration-150 active:scale-[0.96]"
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
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
