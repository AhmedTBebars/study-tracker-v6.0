import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Target, Flame, BarChart, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

interface CalendarHeatmapProps {
  className?: string;
}

interface DayData {
  date: string;
  value: number;
  tasks: number;
  completed: number;
  focusTime: number;
  level: 0 | 1 | 2 | 3 | 4; // Intensity level for color
}

export function CalendarHeatmap({ className }: CalendarHeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMetric, setSelectedMetric] = useState<"completion" | "tasks" | "focus">("completion");

  // Fetch data
  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: focusSessions = [] } = useQuery<any[]>({
    queryKey: ["/api/focus-sessions"],
  });

  // Dynamically generate the list of years
  const availableYears = useMemo(() => {
    const yearsWithData = new Set(tasks.map(task => new Date(task.date).getFullYear()));
    // Add current and next year to the set
    yearsWithData.add(currentYear);
    yearsWithData.add(currentYear + 1);
    // Convert to sorted array of strings
    return Array.from(yearsWithData).sort((a, b) => b - a).map(String);
  }, [tasks, currentYear]);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const data: DayData[] = [];

    // Create data for each day of the year
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter((task: any) => task.date === dateString);
      const completedTasks = dayTasks.filter((task: any) => task.isDone);
      
      const dayFocusSessions = focusSessions.filter((session: any) => {
        const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
        return sessionDate === dateString;
      });
      
      const totalFocusTime = dayFocusSessions.reduce((sum: number, session: any) => sum + session.duration, 0);
      
      let value = 0;
      if (selectedMetric === "completion") {
        value = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
      } else if (selectedMetric === "tasks") {
        value = dayTasks.length;
      } else if (selectedMetric === "focus") {
        value = totalFocusTime;
      }

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (selectedMetric === "completion") {
        if (value >= 90) level = 4;
        else if (value >= 70) level = 3;
        else if (value >= 50) level = 2;
        else if (value > 0) level = 1;
      } else if (selectedMetric === "tasks") {
        if (value >= 8) level = 4;
        else if (value >= 6) level = 3;
        else if (value >= 4) level = 2;
        else if (value > 0) level = 1;
      } else if (selectedMetric === "focus") {
        if (value >= 120) level = 4; // 2+ hours
        else if (value >= 90) level = 3; // 1.5+ hours  
        else if (value >= 60) level = 2; // 1+ hour
        else if (value > 0) level = 1;
      }

      data.push({
        date: dateString,
        value,
        tasks: dayTasks.length,
        completed: completedTasks.length,
        focusTime: totalFocusTime,
        level
      });
    }

    return data;
  }, [tasks, focusSessions, selectedYear, selectedMetric]);

  // Group data by months and weeks
  const monthsData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(parseInt(selectedYear), i, 1);
      const monthEnd = new Date(parseInt(selectedYear), i + 1, 0);
      
      const monthData = heatmapData.filter(day => {
        const date = new Date(day.date);
        return date >= monthStart && date <= monthEnd;
      });

      const weeks: DayData[][] = [];
      let currentWeek: DayData[] = [];
      
      const firstDay = monthStart.getDay();
      for (let j = 0; j < firstDay; j++) {
        currentWeek.push({ date: "", value: 0, tasks: 0, completed: 0, focusTime: 0, level: 0 });
      }

      monthData.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({ date: "", value: 0, tasks: 0, completed: 0, focusTime: 0, level: 0 });
        }
        weeks.push(currentWeek);
      }

      return {
        name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        weeks
      };
    });

    return months;
  }, [heatmapData, selectedYear]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeDays = heatmapData.filter(day => day.level > 0).length;
    const totalTasks = heatmapData.reduce((sum, day) => sum + day.tasks, 0);
    const totalCompleted = heatmapData.reduce((sum, day) => sum + day.completed, 0);
    const totalFocusTime = heatmapData.reduce((sum, day) => sum + day.focusTime, 0);
    
    const maxValue = Math.max(...heatmapData.map(day => day.value));
    const avgValue = heatmapData.length > 0 ? heatmapData.reduce((sum, day) => sum + day.value, 0) / heatmapData.length : 0;

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedData = [...heatmapData].reverse();
    
    for (const day of sortedData) {
      if (day.date > today) continue;
      if (day.level > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      activeDays,
      totalTasks,
      totalCompleted,
      totalFocusTime: Math.floor(totalFocusTime / 60),
      maxValue,
      avgValue,
      currentStreak
    };
  }, [heatmapData]);

  const getCellColor = (level: 0 | 1 | 2 | 3 | 4) => {
    const colors = {
      0: "bg-muted/30",
      1: "bg-green-200 dark:bg-green-900/40",
      2: "bg-green-300 dark:bg-green-800/60", 
      3: "bg-green-400 dark:bg-green-700/80",
      4: "bg-green-500 dark:bg-green-600"
    };
    return colors[level];
  };

  const formatValue = (day: DayData) => {
    if (selectedMetric === "completion") {
      return `${Math.round(day.value)}%`;
    } else if (selectedMetric === "focus") {
      return `${Math.floor(day.value / 60)}h ${day.value % 60}m`;
    }
    return day.value.toString();
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "completion": return "Completion Rate";
      case "tasks": return "Task Count";
      case "focus": return "Focus Time";
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Metric</label>
                <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completion">Completion Rate</SelectItem>
                    <SelectItem value="tasks">Task Count</SelectItem>
                    <SelectItem value="focus">Focus Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Yearly Summary</CardTitle>
              <CardDescription>{selectedYear} Performance</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Active Days</span>
                </div>
                <span className="text-2xl font-bold mt-1">{stats.activeDays}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Total Tasks</span>
                </div>
                <span className="text-2xl font-bold mt-1">{stats.totalTasks}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Total Focus</span>
                </div>
                <span className="text-2xl font-bold mt-1">{stats.totalFocusTime}h</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart className="w-4 h-4" />
                  <span className="text-sm">Daily Avg</span>
                </div>
                <span className="text-2xl font-bold mt-1">
                  {selectedMetric === "completion" ? `${Math.round(stats.avgValue)}%` : 
                   selectedMetric === "focus" ? `${Math.floor(stats.avgValue / 60)}h` : 
                   Math.round(stats.avgValue)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{getMetricLabel()} - {selectedYear}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={cn("w-3 h-3 rounded-sm", getCellColor(level as any))}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2">
              {monthsData.map((month, monthIndex) => (
                <motion.div
                  key={month.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: monthIndex * 0.05 }}
                  className="space-y-1"
                >
                  <div className="text-xs font-medium text-center text-muted-foreground mb-2">
                    {month.name}
                  </div>
                  <div className="space-y-1">
                    {month.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex gap-1">
                        {week.map((day, dayIndex) => (
                          <Tooltip key={`${weekIndex}-${dayIndex}`}>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                className={cn(
                                  "w-3 h-3 rounded-sm cursor-pointer transition-all",
                                  day.date ? getCellColor(day.level) : "bg-transparent"
                                )}
                              />
                            </TooltipTrigger>
                            {day.date && (
                              <TooltipContent>
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {new Date(day.date).toLocaleDateString()}
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="space-y-1">
                                    <div>{getMetricLabel()}: {formatValue(day)}</div>
                                    <div>Tasks: {day.completed}/{day.tasks}</div>
                                    <div>Focus: {Math.floor(day.focusTime / 60)}h {day.focusTime % 60}m</div>
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}