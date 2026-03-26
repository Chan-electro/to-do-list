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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12122A] border-white/[0.06] text-[#E8E8F0] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#00D4FF]">
            New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white/[0.05] border-white/[0.06] text-[#E8E8F0] placeholder:text-[#8888AA]/50"
            autoFocus
          />

          <Textarea
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white/[0.05] border-white/[0.06] text-[#E8E8F0] placeholder:text-[#8888AA]/50 min-h-[80px]"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white/[0.05] border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12122A] border-white/[0.06]">
                  <SelectItem value="P1">P1 - Critical</SelectItem>
                  <SelectItem value="P2">P2 - High</SelectItem>
                  <SelectItem value="P3">P3 - Medium</SelectItem>
                  <SelectItem value="P4">P4 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">
                Domain
              </label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className="bg-white/[0.05] border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12122A] border-white/[0.06]">
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[#8888AA] mb-1 block">
                Assignee
              </label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="bg-white/[0.05] border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12122A] border-white/[0.06]">
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
              <label className="text-xs text-[#8888AA] mb-1 block">
                Est. Minutes
              </label>
              <Input
                type="number"
                placeholder="60"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="bg-white/[0.05] border-white/[0.06]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8888AA] mb-1 block">
              Due Date
            </label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white/[0.05] border-white/[0.06] text-[#E8E8F0]"
            />
          </div>

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
              disabled={!title.trim() || createTask.isPending}
              className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A0A1A] font-medium"
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
