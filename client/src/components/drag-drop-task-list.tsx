import { useState } from "react";
import { Task } from "@shared/schema";
import { TaskCard } from "./task-card";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropTaskListProps {
  tasks: Task[];
  onReorderTasks: (taskIds: string[]) => void;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onLogProgress: (task: Task) => void;
  onAddTask: () => void;
  title?: string;
  showDate?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DragDropTaskList({
  tasks,
  onReorderTasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onLogProgress,
  onAddTask,
  title = "Tasks",
  showDate = false,
  emptyMessage = "No tasks yet. Create your first task to get started!",
  className
}: DragDropTaskListProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const completedTasks = tasks.filter(task => task.isDone);
  const pendingTasks = tasks.filter(task => !task.isDone);

  const handleReorder = (reorderedTasks: Task[]) => {
    const taskIds = reorderedTasks.map(task => task.id);
    onReorderTasks(taskIds);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isOverdue = (task: Task) => {
    const today = getTodayDate();
    return task.date < today && !task.isDone;
  };

  const getTaskGroupColor = (task: Task) => {
    if (task.isDone) return "border-l-green-400";
    if (isOverdue(task)) return "border-l-red-400";
    if (task.date === getTodayDate()) return "border-l-blue-400";
    return "border-l-gray-300";
  };

  if (tasks.length === 0) {
    return (
      <Card className={cn("relative", className)}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {title}
          </CardTitle>
          <Button onClick={onAddTask} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">{emptyMessage}</p>
            <Button onClick={onAddTask} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Create First Task
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Task Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {title}
            {showDate && (
              <Badge variant="outline" className="ml-2">
                {new Date().toLocaleDateString()}
              </Badge>
            )}
          </CardTitle>
          <Button onClick={onAddTask} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>{pendingTasks.length} pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>{completedTasks.length} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>{tasks.filter(isOverdue).length} overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks - Draggable */}
      {pendingTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Pending Tasks
                <Badge variant="secondary">{pendingTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Reorder.Group
                axis="y"
                values={pendingTasks}
                onReorder={handleReorder}
                className="space-y-3"
              >
                <AnimatePresence>
                  {pendingTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      onDragStart={() => setDraggedItem(task.id)}
                      onDragEnd={() => setDraggedItem(null)}
                      className="cursor-grab active:cursor-grabbing"
                      whileDrag={{
                        scale: 1.02,
                        rotate: 2,
                        zIndex: 50,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      }}
                    >
                      <TaskCard
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStartFocus={onStartFocus}
                        onLogProgress={onLogProgress}
                        isDragging={draggedItem === task.id}
                        dragHandleProps={{ 
                          onMouseDown: (e: any) => e.stopPropagation() 
                        }}
                      />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completed Tasks - Non-draggable */}
      {completedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Completed Tasks
                <Badge variant="secondary">{completedTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {completedTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskCard
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStartFocus={onStartFocus}
                        onLogProgress={onLogProgress}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}