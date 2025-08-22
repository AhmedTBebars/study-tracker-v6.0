import { useQuery } from "@tanstack/react-query";
import { AdvancedAnalytics } from "@/components/advanced-analytics";
import StatCard from "@/components/ui/stat-card";
import { BarChart, CheckCircle, Timer, Flame } from "lucide-react";
import { exportToCSV } from "@/lib/csv-utils";
import { exportToExcel } from "@/lib/excel-utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Analytics() {
  const { toast } = useToast();

  // Fetch data
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: focusSessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/focus-sessions"],
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const isLoading = isLoadingTasks || isLoadingSessions || isLoadingStats;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Calculate comparison percentages
  const completionRateDiff = (stats?.today?.completionRate || 0) - (stats?.yesterday?.completionRate || 0);
  // --- FIX: Use the new property name for calculations ---
  const focusTimeDiff = (stats?.today?.dailyFocusTime || 0) - (stats?.yesterday?.dailyFocusTime || 0);
  const focusTimePercentageDiff = (stats?.yesterday?.dailyFocusTime || 0) > 0
    ? Math.round((focusTimeDiff / (stats.yesterday.dailyFocusTime)) * 100)
    : (stats?.today?.dailyFocusTime || 0) > 0 ? 100 : 0;

  // Process data for charts
  const processWeeklyData = () => {
    const today = new Date();
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter((task: any) => task.date === dateString);
      const completedTasks = dayTasks.filter((task: any) => task.isDone);
      const percentage = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
      
      weeklyData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.round(percentage),
        date: dateString,
      });
    }
    
    return weeklyData;
  };

  const processMonthlyData = () => {
    const today = new Date();
    const monthlyData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter((task: any) => task.date === dateString);
      const completedTasks = dayTasks.filter((task: any) => task.isDone);
      const percentage = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
      
      monthlyData.push({
        value: Math.round(percentage),
        date: dateString,
      });
    }
    
    return monthlyData;
  };

  const processFocusDistribution = () => {
    const topicTimes: Record<string, number> = {};
    
    focusSessions.forEach((session: any) => {
      const task = tasks.find((t: any) => t.id === session.taskId);
      const topic = task?.topic || "General";
      topicTimes[topic] = (topicTimes[topic] || 0) + session.duration;
    });
    
    return Object.entries(topicTimes).map(([topic, time]) => ({
      name: topic,
      value: time,
    }));
  };

  const handleExport = (format: "csv" | "excel") => {
    try {
      const exportData = {
        tasks: tasks.map((task: any) => ({
          Date: task.date,
          Title: task.title,
          Topic: task.topic,
          Time: task.time,
          Is_Done: task.isDone ? 1 : 0,
          Progress: task.progress,
          Difficulty: task.difficulty,
          Focus_Sessions: task.focusSessions,
        })),
        focusSessions: focusSessions.map((session: any) => ({
          Task_ID: session.taskId || "General",
          Duration: session.duration,
          Session_Type: session.sessionType,
          Completed_At: new Date(session.completedAt).toLocaleString(),
        })),
        weeklyProgress: processWeeklyData(),
        focusDistribution: processFocusDistribution(),
      };

      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === "excel") {
        exportToExcel(exportData, `study-tracker-analytics-${timestamp}.xlsx`);
      } else {
        exportToCSV(exportData.tasks, `study-tracker-analytics-${timestamp}.csv`);
      }

      toast({
        title: "Export successful! 📊",
        description: `Analytics data has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Prepare analytics data
  const analyticsData = {
    totalTasks: stats?.totalTasks || 0,
    completedTasks: stats?.today?.completedTasks || 0, // Corrected to today's completed tasks
    todayTasks: stats?.today?.totalTasks || 0, // Corrected to today's total tasks
    totalFocusTime: stats?.today?.dailyFocusTime || 0, // Corrected to use daily focus time
    streak: stats?.streak || 0,
    weeklyProgress: processWeeklyData(),
    difficultyBreakdown: [
      { name: 'Easy', value: tasks.filter((t: any) => t.difficulty === 'easy').length, color: '#22c55e' },
      { name: 'Medium', value: tasks.filter((t: any) => t.difficulty === 'medium').length, color: '#f59e0b' },
      { name: 'Hard', value: tasks.filter((t: any) => t.difficulty === 'hard').length, color: '#ef4444' }
    ],
    focusPattern: processFocusDistribution(),
    productivityTrend: processMonthlyData().map((item, index) => ({
      date: `Day ${index + 1}`,
      productivity: item.value
    }))
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your productivity and progress over time
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tasks"
            value={stats?.totalTasks?.toString() || '0'}
            comparisonValue={0}
            icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Completion Rate"
            value={`${stats?.today?.completionRate || 0}%`}
            comparisonValue={completionRateDiff}
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Focus Time"
            // --- FIX: Use the new property name for display ---
            value={`${Math.floor((stats?.today?.dailyFocusTime || 0) / 60)}h ${(stats?.today?.dailyFocusTime || 0) % 60}m`}
            comparisonValue={focusTimePercentageDiff}
            icon={<Timer className="h-4 w-4 text-muted-foreground" />}
          />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.streak || 0} Days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>
        </div>
        <AdvancedAnalytics data={analyticsData} />
      </div>
    </div>
  );
}
