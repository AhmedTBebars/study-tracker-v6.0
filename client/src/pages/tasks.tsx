import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AddTaskModal } from "../components/add-task-modal";
import { ProgressModal } from "../components/progress-modal";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Task } from "../../shared/schema";
import { Search, Plus, ListFilter } from "lucide-react";
import { useFocusStore } from "../stores/focus-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { GroupedTaskList } from "../components/grouped-task-list";

const filters = [
  { id: "all", label: "All Tasks" },
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

type TaskListContext = { previousTasks?: Task[], queryKey: string[] } | undefined;

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [addTaskModalKey, setAddTaskModalKey] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isActive, currentTaskId, stopAndLogSession, startSession, sessionType } = useFocusStore();

  // --- FIX: Add effect to refetch data when a focus session completes ---
  const prevSessionTypeRef = useRef(sessionType);
  useEffect(() => {
    // When sessionType changes from 'focus' to 'break', it means a session was completed.
    if (prevSessionTypeRef.current === 'focus' && sessionType === 'break') {
      toast({
        title: "Focus Session Logged!",
        description: "Your task has been updated with the completed session.",
      });
      // Refetch all task lists to show the new focus session count
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
    }
    prevSessionTypeRef.current = sessionType;
  }, [sessionType, queryClient, toast]);

  const getQueryKey = () => {
    switch (activeFilter) {
      case "today": return ["/api/tasks/today"];
      case "overdue": return ["/api/tasks/overdue"];
      default: return ["/api/tasks"];
    }
  };

  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: getQueryKey() });

  const topics = useMemo(() => Array.from(new Set(tasks.map((task: Task) => task.topic).filter(Boolean))), [tasks]);

  const { groupedTasks } = useMemo(() => {
    const filtered = tasks.filter((task: Task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = selectedTopic === "all" || task.topic === selectedTopic;
      if (activeFilter === "completed") return matchesSearch && matchesTopic && task.isDone;
      return matchesSearch && matchesTopic;
    });
    const grouped = filtered.reduce((acc: Record<string, Task[]>, task: Task) => {
      const topic = task.topic || "Uncategorized";
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(task);
      return acc;
    }, {});
    return { groupedTasks: grouped };
  }, [tasks, searchTerm, selectedTopic, activeFilter]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => apiRequest("PATCH", `/api/tasks/${id}/status`, data),
    onMutate: async (newData) => {
      const queryKey = getQueryKey();
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) => old?.map(task => task.id === newData.id ? { ...task, ...newData.data } : task));
      return { previousTasks, queryKey };
    },
    onError: (err, newData, context: TaskListContext) => {
      if (context?.previousTasks) queryClient.setQueryData(context.queryKey, context.previousTasks);
      toast({ title: "Update failed", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onMutate: async (deletedTaskId) => {
      const queryKey = getQueryKey();
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) => old?.filter(task => task.id !== deletedTaskId));
      return { previousTasks, queryKey };
    },
    onError: (err, deletedTaskId, context: TaskListContext) => {
      if (context?.previousTasks) queryClient.setQueryData(context.queryKey, context.previousTasks);
      toast({ title: "Deletion failed", variant: "destructive" });
    },
    onSuccess: () => toast({ title: "Task deleted" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
    },
  });

  const handleToggleComplete = async (task: Task) => {
    if (!task.isDone && isActive && currentTaskId === task.id) {
      await stopAndLogSession();
      await queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      toast({ title: "Task Completed!", description: "Focus session stopped and time logged." });
    }
    updateTaskMutation.mutate({ id: task.id, data: { isDone: !task.isDone, progress: !task.isDone ? 100 : 0 } });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setAddTaskModalKey(task.id.hashCode());
    setShowAddTask(true);
  };

  const handleDelete = (taskId: string) => {
    if (selectedTask && selectedTask.id === taskId) setSelectedTask(null);
    deleteTaskMutation.mutate(taskId);
  };

  const handleOpenAddTaskModal = () => {
    setSelectedTask(null);
    setAddTaskModalKey(prevKey => prevKey + 1);
    setShowAddTask(true);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-8 py-4 bg-card shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-1">Organize and track your daily tasks</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            {filters.map((filter) => (
              <Button key={filter.id} variant={activeFilter === filter.id ? "default" : "ghost"} onClick={() => setActiveFilter(filter.id)}>
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <ListFilter className="text-muted-foreground w-4 h-4" />
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by topic" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
            </div>
            <Button onClick={handleOpenAddTaskModal} className="btn-premium">
              <Plus className="w-4 h-4 mr-2" />Add Task
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <GroupedTaskList
            groupedTasks={groupedTasks}
            onToggleComplete={handleToggleComplete}
            onEditTask={handleEdit}
            onDeleteTask={(task) => handleDelete(task.id)}
            onStartFocus={(task) => startSession(task.id)}
            onLogProgress={(task) => { setSelectedTask(task); setShowProgress(true); }}
            onAddTask={handleOpenAddTaskModal}
          />
        </div>
      </div>
      <AddTaskModal key={addTaskModalKey} open={showAddTask} onOpenChange={setShowAddTask} task={selectedTask} />
      {selectedTask && <ProgressModal open={showProgress} onOpenChange={setShowProgress} task={selectedTask} />}
    </div>
  );
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};
