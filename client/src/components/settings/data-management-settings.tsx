import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { ArchiveRestore, RotateCcw, Trash2, Database } from "lucide-react";

export default function DataManagementSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearDataMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/data/all'),
    onSuccess: () => {
      queryClient.invalidateQueries(); // Refetch all data
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

  const handleBackup = async () => {
    // This logic is moved from the old settings page
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

  const handleRestore = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Restoring data from a backup will be available in a future update.",
    });
  };

  const handleClearData = () => {
    // We will replace this with a custom confirmation dialog later
    if (window.confirm("Are you sure you want to delete ALL your data? This action cannot be undone.")) {
      clearDataMutation.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Management
        </CardTitle>
        <CardDescription>
          Backup, restore, or clear your application data.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={handleBackup} variant="outline" className="h-16">
          <ArchiveRestore className="w-5 h-5 mr-2" />
          Backup Data
        </Button>
        <Button onClick={handleRestore} variant="outline" className="h-16">
          <RotateCcw className="w-5 h-5 mr-2" />
          Restore Data
        </Button>
        <Button
          onClick={handleClearData}
          variant="destructive"
          className="h-16 md:col-span-2"
          disabled={clearDataMutation.isPending}
        >
          <Trash2 className="w-5 h-5 mr-2" />
          {clearDataMutation.isPending ? "Clearing..." : "Clear All Data"}
        </Button>
      </CardContent>
    </Card>
  );
}
