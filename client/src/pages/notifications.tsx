import { SmartNotifications } from "@/components/smart-notifications";
import { useSettingsStore } from "@/stores/settings-store";

export default function Notifications() {
  const { 
    notificationsEnabled, 
    morningTime, 
    focusBreaksNotificationsEnabled 
  } = useSettingsStore();

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-8 py-4 bg-card">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Smart productivity notifications and alerts
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="bg-card rounded-lg border border-border">
          <SmartNotifications 
            enabled={notificationsEnabled}
            reminderTime={morningTime}
            focusBreaksEnabled={focusBreaksNotificationsEnabled}
          />
        </div>
      </div>
    </div>
  );
}