import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { useSettingsStore } from "../../stores/settings-store";
import { Bell } from "lucide-react";

export default function NotificationSettings() {
  const {
    notificationsEnabled,
    morningTime,
    eveningTime,
    focusBreaksNotificationsEnabled,
    setNotificationsEnabled,
    setMorningTime,
    setEveningTime,
    setFocusBreaksNotificationsEnabled,
  } = useSettingsStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <Label className="text-base font-medium">Daily Reminders</Label>
            <p className="text-sm text-muted-foreground">Get notified about today's tasks.</p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="block text-base font-medium">Morning Reminder</Label>
            <Input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="h-10"
              disabled={!notificationsEnabled}
            />
          </div>
          <div className="space-y-3">
            <Label className="block text-base font-medium">Evening Review</Label>
            <Input
              type="time"
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
              className="h-10"
              disabled={!notificationsEnabled}
            />
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <Label className="text-base font-medium">Focus Session Breaks</Label>
            <p className="text-sm text-muted-foreground">Remind when it's time for a break.</p>
          </div>
          <Switch
            checked={focusBreaksNotificationsEnabled}
            onCheckedChange={setFocusBreaksNotificationsEnabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
