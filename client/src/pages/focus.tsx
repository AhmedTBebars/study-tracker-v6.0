import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFocusStore } from "@/stores/focus-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Timer, Clock, Target, Play, Pause, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Task } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { AdvancedCircularTimer } from "@/components/advanced-circular-timer";
import { Separator } from "@/components/ui/separator";
import dayjs from "@/lib/dayjs";

export default function Focus() {
  const timeRemaining = useFocusStore((state) => state.timeRemaining);
  const sessionType = useFocusStore((state) => state.sessionType);
  const isActive = useFocusStore((state) => state.isActive);
  const currentTaskId = useFocusStore((state) => state.currentTaskId);
  const { startSession, togglePause, reset, syncTimeToSettings } = useFocusStore();

  const sessionLength = useSettingsStore((state) => state.sessionLength);
  const breakLength = useSettingsStore((state) => state.breakLength);
  const focusTimerColor = useSettingsStore((state) => state.focusTimerColor);

  useEffect(() => {
    syncTimeToSettings();
  }, [sessionLength, breakLength, syncTimeToSettings]);

  const totalDuration = sessionType === 'focus' ? sessionLength * 60 : breakLength * 60;

  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const currentTask = tasks.find(task => task.id === currentTaskId);

  const { data: focusSessions = [] } = useQuery<Array<{ id: string; completedAt: string; sessionType: string; duration: number; taskId?: string; }>>({
    queryKey: ["/api/focus-sessions"],
  });

  const todayFocusSessions = focusSessions.filter((session) => {
    const today = new Date().toISOString().split('T')[0];
    const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
    return sessionDate === today && session.sessionType === "focus";
  });

  const totalFocusTimeToday = todayFocusSessions.reduce((total, session) => total + session.duration, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-8 py-4 bg-card shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Focus Mode</h1>
          <p className="text-muted-foreground mt-1">Your dedicated space for deep work.</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-card p-8 rounded-lg border">
            <div className="h-12 mb-6">
              {currentTask ? (
                <Badge variant="secondary" className="text-base py-2 px-4 flex items-center gap-2 shadow-sm">
                  <Target className="w-4 h-4" />
                  {currentTask.title}
                </Badge>
              ) : (
                <p className="text-muted-foreground">General Focus Session</p>
              )}
            </div>
            
            <AdvancedCircularTimer
              timeRemaining={timeRemaining}
              totalDuration={totalDuration}
              sessionType={sessionType}
              color={focusTimerColor}
            />
            
            <div className="mt-10 flex items-center justify-center space-x-4">
              <Button onClick={togglePause} variant="outline" size="lg" className="w-32">
                {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isActive ? "Pause" : "Resume"}
              </Button>
              <Button onClick={() => startSession()} size="lg" disabled={isActive} className="w-32">
                Start
              </Button>
              <Button onClick={reset} variant="ghost" size="lg" className="w-32">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {todayFocusSessions.length > 0 ? (
                  todayFocusSessions.map((session) => {
                    const task = tasks.find(t => t.id === session.taskId);
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-sm truncate" title={task ? task.title : "General Focus"}>
                              {task ? task.title : "General Focus"}
                            </p>
                            <p className="text-xs text-muted-foreground">{session.duration} minutes</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {dayjs(session.completedAt).format('h:mm A')}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-muted-foreground">No sessions completed today.</p>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />

              <div className="space-y-4">
                 <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Summary
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sessions Today</span>
                  <span className="font-bold text-lg">{todayFocusSessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Focus Time</span>
                  <span className="font-bold text-lg text-green-600">{formatTime(totalFocusTimeToday)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}