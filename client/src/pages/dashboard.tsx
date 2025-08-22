import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TaskCard } from "../components/task-card";
import { Task } from "../../shared/schema";
import { Calendar, CheckCircle, Timer, Flame, Plus, ListTodo } from "lucide-react";
import { useState } from "react";
import { AddTaskModal } from "../components/add-task-modal";
import { ProgressModal } from "../components/progress-modal";
import { useFocusStore } from "../stores/focus-store";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

// Define interfaces for the data types
interface DashboardStats {
  today: {
    totalTasks: number;
    completedTasks: number;
    dailyFocusTime: number;
  };
  streak: number;
}

// Helper type for context in optimistic updates
type TaskListContext = { previousTodayTasks?: Task[], previousOverdueTasks?: Task[] } | undefined;


export default function Dashboard() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [addTaskModalKey, setAddTaskModalKey] = useState(0);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isActive, currentTaskId, stopAndLogSession, startSession } = useFocusStore();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) =>
      apiRequest("PATCH", `/api/tasks/${id}/status`, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["/api/tasks/today"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["/api/tasks/today"]);
      queryClient.setQueryData<Task[]>(["/api/tasks/today"], (old) =>
        old?.map(task => task.id === newData.id ? { ...task, ...newData.data } : task)
      );
      return { previousTasks };
    },
    onError: (err, newData, context: { previousTasks?: Task[] } | undefined) => {
      queryClient.setQueryData(["/api/tasks/today"], context?.previousTasks);
      toast({ title: "Update failed", description: "Could not update task status.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue/related"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onMutate: async (deletedTaskId) => {
        await queryClient.cancelQueries({ queryKey: ["/api/tasks/today"] });
        await queryClient.cancelQueries({ queryKey: ["/api/tasks/overdue/related"] });

        const previousTodayTasks = queryClient.getQueryData<Task[]>(["/api/tasks/today"]);
        const previousOverdueTasks = queryClient.getQueryData<Task[]>(["/api/tasks/overdue/related"]);

        queryClient.setQueryData<Task[]>(["/api/tasks/today"], (old) =>
            old?.filter(task => task.id !== deletedTaskId)
        );
        queryClient.setQueryData<Task[]>(["/api/tasks/overdue/related"], (old) =>
            old?.filter(task => task.id !== deletedTaskId)
        );

        return { previousTodayTasks, previousOverdueTasks };
    },
    onError: (err, deletedTaskId, context: TaskListContext) => {
        queryClient.setQueryData(["/api/tasks/today"], context?.previousTodayTasks);
        queryClient.setQueryData(["/api/tasks/overdue/related"], context?.previousOverdueTasks);
        toast({ title: "Deletion failed", description: "Could not delete the task.", variant: "destructive" });
    },
    onSuccess: () => {
        toast({ title: "Task deleted", description: "The task has been removed from your list." });
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue/related"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const handleToggleComplete = async (taskToUpdate: Task) => {
    if (!taskToUpdate.isDone && isActive && currentTaskId === taskToUpdate.id) {
      await stopAndLogSession();
      await queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      toast({
        title: "Task Completed!",
        description: "Focus session stopped and time has been logged.",
      });
    }
    updateTaskMutation.mutate({
      id: taskToUpdate.id,
      data: { isDone: !taskToUpdate.isDone, progress: !taskToUpdate.isDone ? 100 : 0 },
    });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setAddTaskModalKey(task.id.hashCode()); 
    setShowAddTask(true);
  };

  const handleDelete = (taskId: string) => {
    if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
    }
    deleteTaskMutation.mutate(taskId);
  };
  
  const handleOpenAddTaskModal = () => {
    setSelectedTask(null);
    setAddTaskModalKey(prevKey => prevKey + 1);
    setShowAddTask(true);
  };

  // Data fetching from the API
  const { data: todayTasks = [], isLoading: isLoadingToday } = useQuery<Task[]>({ queryKey: ["/api/tasks/today"] });
  const { data: overdueTasks = [], isLoading: isLoadingOverdue } = useQuery<Task[]>({ queryKey: ["/api/tasks/overdue/related"] });
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({ 
    queryKey: ["/api/dashboard/stats"],
    refetchOnMount: 'always',
  });

  const isLoading = isLoadingToday || isLoadingOverdue || isLoadingStats;

  // Calculate derived state
  const completedToday = stats?.today?.completedTasks || 0;
  const totalToday = stats?.today?.totalTasks || 0;
  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-8 py-4 bg-card shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your progress overview for today.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {isLoading ? (
            <div>Loading...</div>
        ) : (
        <>
            {/* --- FIX: Changed grid to 3 columns and removed Focus Time card --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Today's Tasks</p>
                    <p className="text-2xl font-bold mt-1">{totalToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold mt-1 text-success">{completedToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Streak</p>
                    <p className="text-2xl font-bold mt-1">{stats?.streak || 0} days</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Progress & Focus</CardTitle>
                    <CardDescription>Start a session or review your day.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-4">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted opacity-20" />
                          <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round" className="text-primary transition-all duration-1000" strokeDasharray="339.292" strokeDashoffset={339.292 * (1 - progressPercentage / 100)} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                            <p className="text-xs text-muted-foreground">Complete</p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full space-y-3">
                        <Button className="w-full btn-premium" onClick={() => startSession()}>
                          <Timer className="w-4 h-4 mr-2" />
                          Start Focus Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Today's Tasks</CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleOpenAddTaskModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {todayTasks.length > 0 || overdueTasks.length > 0 ? (
                      <>
                        {todayTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onToggleComplete={() => handleToggleComplete(task)} onEdit={() => handleEdit(task)} onDelete={() => handleDelete(task.id)} onStartFocus={() => startSession(task.id)} onLogProgress={() => { setSelectedTask(task); setShowProgress(true); }} />
                        ))}
                        {overdueTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onToggleComplete={() => handleToggleComplete(task)} onEdit={() => handleEdit(task)} onDelete={() => handleDelete(task.id)} onStartFocus={() => startSession(task.id)} onLogProgress={() => { setSelectedTask(task); setShowProgress(true); }} isOverdue />
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">All clear for today!</p>
                        <p className="text-sm text-muted-foreground">Add a new task to get started.</p>
                        <Button variant="outline" onClick={handleOpenAddTaskModal} className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first task
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
        </>
        )}
      </div>

      <AddTaskModal key={addTaskModalKey} open={showAddTask} onOpenChange={setShowAddTask} task={selectedTask} />
      {selectedTask && <ProgressModal open={showProgress} onOpenChange={setShowProgress} task={selectedTask} />}
    </div>
  );
}

// Helper function to generate a hash from a string (for unique keys)
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
