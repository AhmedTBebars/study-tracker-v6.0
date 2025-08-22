import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/lib/csv-utils";
import { exportToExcel } from "@/lib/excel-utils";

export function ImportExport() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("csvFile", file); // تغيير "file" إلى "csvFile" لتطابق الخادم

    try {
      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
        // لا تحدد headers يدوياً لطلبات FormData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Import failed");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: `Imported ${result.imported} tasks`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const handleExportCSV = () => {
    try {
      const exportData = (tasks as any[]).map((task) => ({
        Date: task.date,
        Title: task.title,
        Topic: task.topic,
        Is_Done: task.isDone ? 1 : 0,
        Time: task.time || "",
        Progress: task.progress || 0,
        Difficulty: task.difficulty || "medium",
        Focus_Sessions: task.focusSessions || 0,
        Order_Index: task.orderIndex || 0,
      }));

      exportToCSV(
        exportData,
        `study-tracker-${new Date().toISOString().split("T")[0]}.csv`
      );

      toast({
        title: "Export successful",
        description: "Your data has been exported as CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data as CSV",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = (tasks as any[]).map((task) => ({
        Date: task.date,
        Title: task.title,
        Topic: task.topic,
        "Is Done": task.isDone ? "Yes" : "No",
        Time: task.time || "",
        "Progress (%)": task.progress || 0,
        Difficulty: task.difficulty || "medium",
        "Focus Sessions": task.focusSessions || 0,
        "Order Index": task.orderIndex || 0,
        "Created At": task.createdAt
          ? new Date(task.createdAt).toLocaleDateString()
          : "",
      }));

      exportToExcel(
        exportData,
        `study-tracker-${new Date().toISOString().split("T")[0]}.xlsx`
      );

      toast({
        title: "Export successful",
        description: "Your data has been exported as Excel file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data as Excel",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="file-upload">Upload CSV File</Label>
            <div className="mt-2">
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isImporting}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Import tasks from CSV with columns: Date, Title, Topic, Is_Done
            </p>
          </div>

          {isImporting && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Importing data...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center justify-center space-x-2 h-16"
            >
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-muted-foreground">
                  Compatible with Excel and analysis tools
                </div>
              </div>
            </Button>

            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="flex items-center justify-center space-x-2 h-16"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Export as Excel</div>
                <div className="text-xs text-muted-foreground">
                  Excel format with formatted columns
                </div>
              </div>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Export includes all tasks with dates, progress, and focus session
            data.
          </p>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(tasks as any[]).length}
              </div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {(tasks as any[]).filter((task: any) => task.isDone).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {(tasks as any[]).filter((task: any) => !task.isDone).length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {new Set((tasks as any[]).map((task: any) => task.topic)).size}
              </div>
              <div className="text-sm text-muted-foreground">Topics</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
