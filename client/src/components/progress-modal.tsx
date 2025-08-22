import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export function ProgressModal({ open, onOpenChange, task }: ProgressModalProps) {
  const [progress, setProgress] = useState(task.progress || 0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setProgress(task.progress || 0);
    }
  }, [open, task]);

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { progress: number; isDone: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${task.id}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Progress updated successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to update progress", variant: "destructive" });
    },
  });

  const handleSave = () => {
    // ✅ الحل: نرسل دائمًا حالتي التقدم والإكمال معًا
    const isCompleted = progress === 100;
    updateTaskMutation.mutate({ progress, isDone: isCompleted });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>Log your progress for: {task.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Progress</Label>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateTaskMutation.isPending}>
            {updateTaskMutation.isPending ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}