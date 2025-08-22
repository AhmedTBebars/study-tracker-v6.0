import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Palette, Timer, Bell, Database, Mail, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/stores/settings-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AppearanceSettings from "@/components/settings/appearance-settings";
import FocusSettings from "@/components/settings/focus-settings";
import NotificationSettings from "@/components/settings/notification-settings";
import DataManagementSettings from "@/components/settings/data-management-settings";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { email, googleCalendarConnected, setEmail } = useSettingsStore();

  // Data Management Mutations
  const clearDataMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/data/all'),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Data Cleared",
        description: "All your tasks and sessions have been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not clear data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGoogleCalendarConnect = () => {
    toast({
      title: "Google Calendar Integration",
      description: "This feature will be available in a future update.",
    });
  };

  const handleEmailSetup = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email Reports Setup",
      description: "This feature will be available in a future update.",
    });
  };

  const handleBackup = async () => {
    try {
      const response = await apiRequest('GET', '/api/data/backup');
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Successful",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Could not create a backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete ALL your data? This action cannot be undone.")) {
      clearDataMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-8 py-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize and manage your Study Tracker experience.
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <Tabs defaultValue="appearance" className="flex flex-col md:flex-row gap-8">
          <TabsList className="flex md:flex-col items-start h-full w-full md:w-48 shrink-0">
            <TabsTrigger value="appearance" className="w-full justify-start p-3">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="focus" className="w-full justify-start p-3">
              <Timer className="w-4 h-4 mr-2" />
              Focus
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start p-3">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="data" className="w-full justify-start p-3">
              <Database className="w-4 h-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger value="integrations" className="w-full justify-start p-3">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="appearance">
              <AppearanceSettings />
            </TabsContent>
            <TabsContent value="focus">
              <FocusSettings />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="data">
              <DataManagementSettings />
            </TabsContent>
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <Label className="text-base font-medium">
                          Google Calendar
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Sync tasks as calendar events
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleGoogleCalendarConnect}
                      variant={
                        googleCalendarConnected
                          ? "outline"
                          : "default"
                      }
                    >
                      {googleCalendarConnected
                        ? "Connected"
                        : "Connect"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <Label className="text-base font-medium">
                          Email Reports
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Weekly and monthly progress reports
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email || ''}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-40 h-10"
                      />
                      <Button onClick={handleEmailSetup}>Setup</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}