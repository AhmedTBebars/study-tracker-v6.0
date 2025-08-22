import { Task } from "@shared/schema";
import { TaskCard } from "./task-card";
import { AnimatePresence, motion } from "framer-motion";
import { Folder, Plus, Inbox } from "lucide-react";
import { Button } from "./ui/button";

interface GroupedTaskListProps {
  groupedTasks: Record<string, Task[]>;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onLogProgress: (task: Task) => void;
  onAddTask: () => void;
}

export function GroupedTaskList({
  groupedTasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onLogProgress,
  onAddTask,
}: GroupedTaskListProps) {
  const topics = Object.keys(groupedTasks);

  if (topics.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-muted rounded-lg">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by adding a new task.
        </p>
        <div className="mt-6">
          <Button onClick={onAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {topics.map((topic) => (
          <motion.div
            key={topic}
            // --- ANIMATION FIX: Removed layout prop to prevent stretching ---
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Folder className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{topic}</h2>
              <span className="text-sm font-mono bg-muted text-muted-foreground rounded-md px-2 py-1">
                {groupedTasks[topic].length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedTasks[topic].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStartFocus={onStartFocus}
                  onLogProgress={onLogProgress}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
