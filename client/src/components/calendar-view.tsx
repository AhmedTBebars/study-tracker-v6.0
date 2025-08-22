import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
  onAddTask: () => void;
}

export function CalendarView({ onDateSelect, selectedDate, onAddTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const getTasksForDate = (date: string) => {
    return (tasks as any[]).filter((task: any) => task.date === date);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return formatDateKey(date) === selectedDate;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[140px] text-center">
              <span className="font-medium">{monthYear}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-20" />;
            }

            const dateKey = formatDateKey(day);
            const dayTasks = getTasksForDate(dateKey);
            const completedTasks = dayTasks.filter((task: any) => task.isDone);

            return (
              <div
                key={index}
                className={`
                  h-20 p-1 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50
                  ${isSelected(day) ? 'bg-primary/10 border-primary' : 'border-border'}
                  ${isToday(day) ? 'bg-accent/50' : ''}
                `}
                onClick={() => onDateSelect(dateKey)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isToday(day) ? 'font-bold' : ''}`}>
                      {day.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 mt-1">
                    {dayTasks.slice(0, 2).map((task: any, taskIndex: number) => (
                      <div
                        key={taskIndex}
                        className={`text-xs p-1 mb-1 rounded truncate ${
                          task.isDone 
                            ? 'bg-success/20 text-success line-through' 
                            : 'bg-primary/20 text-primary'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}