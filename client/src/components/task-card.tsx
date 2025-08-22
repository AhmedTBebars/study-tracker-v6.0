import { Task } from "../../shared/schema";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { MoreHorizontal, Clock, Target, GripVertical, CalendarDays, Timer as TimerIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "../lib/utils";
import dayjs from "../lib/dayjs";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onLogProgress: (task: Task) => void;
  isDragging?: boolean;
  isOverdue?: boolean;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onStartFocus, 
  onLogProgress,
  isDragging = false,
  isOverdue = false,
  ...rest
}, ref) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <motion.div
      ref={ref}
      {...rest}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      // --- FIX: Added a spring transition for smoother, more natural animation ---
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(isDragging ? 'rotate-2 shadow-xl z-50' : '')}
    >
      <Card className={cn(
        `transition-all duration-300 hover:shadow-lg border-l-4`,
        task.isDone ? 'opacity-75 border-l-green-400' :
        isOverdue ? 'border-l-red-500' : 'border-l-primary/50'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex items-center pt-1 space-x-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <Checkbox
                    checked={task.isDone || false}
                    onCheckedChange={() => onToggleComplete(task)}
                />
            </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={cn('font-medium', task.isDone && 'line-through text-muted-foreground')}>
                {task.title}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLogProgress(task)}>Log Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStartFocus(task)}>Start Focus Session</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <Badge variant="outline">{task.topic}</Badge>
              <Badge className={getDifficultyColor(task.difficulty || "medium")}>
                {task.difficulty || "medium"}
              </Badge>
              {isOverdue && !task.isDone && <Badge variant="destructive">Overdue</Badge>}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-1">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 w-4" />
                <span>{task.time || "09:00"}</span>
              </div>
              
              {isOverdue && (
                <div className="flex items-center space-x-1">
                  <CalendarDays className="w-4 h-4" />
                  <span>{dayjs(task.date).format("MMM D")}</span>
                </div>
              )}
              
              {task.progress != null && task.progress > 0 && (
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{task.progress || 0}% Complete</span>
                </div>
              )}

              {task.focusSessions > 0 && (
                <div className="flex items-center space-x-1">
                  <TimerIcon className="w-4 h-4 text-orange-500" />
                  <span>{task.focusSessions}</span>
                </div>
              )}
            </div>
            
            {task.progress != null && task.progress > 0 && !task.isDone && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
});
