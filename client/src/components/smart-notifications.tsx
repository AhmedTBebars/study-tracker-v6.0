import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Clock, Target, CheckCircle2, AlertTriangle, Settings, X, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore, type NotificationFrequency } from "@/stores/settings-store";

interface SmartNotification {
  id: string;
  type: "reminder" | "break" | "goal" | "streak" | "overdue";
  title: string;
  message: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
  taskId?: string;
  isRead: boolean;
}

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  // Get all settings and setters from global store
  const {
    notificationsEnabled,
    morningTime,
    focusBreaksNotificationsEnabled,
    notificationFrequency,
    dailyGoalUpdates,
    streakMilestones,
    overdueAlerts,
    soundAlerts,
    setNotificationsEnabled,
    setFocusBreaksNotificationsEnabled,
    setMorningTime,
    setNotificationFrequency,
    setDailyGoalUpdates,
    setStreakMilestones,
    setOverdueAlerts,
    setSoundAlerts,
  } = useSettingsStore();

  // Fetch tasks for notification generation
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  // Check notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Generate smart notifications based on tasks and stats
  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      return;
    }

    const generateNotifications = () => {
      const newNotifications: SmartNotification[] = [];
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Task reminders
      const todayTasks = tasks.filter((task: any) => task.date === today && !task.isDone);
      if (todayTasks.length > 0) {
        newNotifications.push({
          id: `reminder-${Date.now()}`,
          type: "reminder",
          title: "Daily Tasks Reminder",
          message: `You have ${todayTasks.length} tasks scheduled for today`,
          timestamp: now,
          priority: "medium",
          isRead: false
        });
      }

      // Overdue alerts
      if (overdueAlerts) {
        const overdueTasks = tasks.filter((task: any) => task.date < today && !task.isDone);
        if (overdueTasks.length > 0) {
          newNotifications.push({
            id: `overdue-${Date.now()}`,
            type: "overdue",
            title: "Overdue Tasks Alert",
            message: `${overdueTasks.length} tasks are overdue and need attention`,
            timestamp: now,
            priority: "high",
            isRead: false
          });
        }
      }

      // Daily goals
      if (dailyGoalUpdates && stats) {
        const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
        if (completionRate >= 80) {
          newNotifications.push({
            id: `goal-${Date.now()}`,
            type: "goal",
            title: "Daily Goal Achieved!",
            message: `Congratulations! You've completed ${Math.round(completionRate)}% of your tasks`,
            timestamp: now,
            priority: "low",
            isRead: false
          });
        }
      }

      // Streak milestones
      if (streakMilestones && stats?.streak && stats.streak % 7 === 0) {
        newNotifications.push({
          id: `streak-${Date.now()}`,
          type: "streak",
          title: "Streak Milestone!",
          message: `Amazing! You've maintained your streak for ${stats.streak} days`,
          timestamp: now,
          priority: "medium",
          isRead: false
        });
      }

      return newNotifications;
    };

    const newNotifications = generateNotifications();
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 20)); // Keep last 20
    }
  }, [tasks, stats, notificationsEnabled, morningTime, focusBreaksNotificationsEnabled, dailyGoalUpdates, streakMilestones, overdueAlerts]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive smart productivity notifications.",
        });
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case "reminder": return Clock;
      case "break": return Clock;
      case "goal": return Target;
      case "streak": return CheckCircle2;
      case "overdue": return AlertTriangle;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium": return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "low": return "text-green-500 bg-green-50 dark:bg-green-900/20";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:p-8">
      {/* Settings Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="font-medium">
                Enable notifications
              </Label>
              <Switch
                id="notifications-enabled"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <Separator />

            <div className="space-y-5 pt-6 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Notification Types</h4>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Focus break alerts</Label>
                <Switch
                  checked={focusBreaksNotificationsEnabled}
                  onCheckedChange={setFocusBreaksNotificationsEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Daily goal updates</Label>
                <Switch
                  checked={dailyGoalUpdates}
                  onCheckedChange={setDailyGoalUpdates}
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Streak milestones</Label>
                <Switch
                  checked={streakMilestones}
                  onCheckedChange={setStreakMilestones}
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Overdue alerts</Label>
                <Switch
                  checked={overdueAlerts}
                  onCheckedChange={setOverdueAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-5 pt-6 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Advanced Settings</h4>
              <div className="space-y-2">
                <Label className="text-sm">Daily reminder time</Label>
                <Input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="w-full bg-background"
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Notification frequency</Label>
                <Select
                  value={notificationFrequency}
                  onValueChange={(value: NotificationFrequency) => setNotificationFrequency(value)}
                  disabled={!notificationsEnabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Essential only)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (All updates)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2">
                  {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  Sound alerts
                </Label>
                <Switch
                  checked={soundAlerts}
                  onCheckedChange={setSoundAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Feed */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            {notifications.length > 0 && (
              <Button
                onClick={clearAllNotifications}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No notifications yet</p>
                  <p className="text-sm text-muted-foreground">
                    Smart notifications will appear here based on your activity
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-4 rounded-lg border transition-all cursor-pointer",
                          notification.isRead 
                            ? "bg-muted/50 border-muted" 
                            : "bg-card border-border hover:shadow-md",
                          getPriorityColor(notification.priority)
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            getPriorityColor(notification.priority)
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={cn(
                                "font-medium text-sm",
                                notification.isRead && "text-muted-foreground"
                              )}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            <p className={cn(
                              "text-sm",
                              notification.isRead ? "text-muted-foreground" : "text-foreground"
                            )}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}