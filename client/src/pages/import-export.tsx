import { EnhancedImportExport } from "@/components/enhanced-import-export";

export default function ImportExport() {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-8 py-4 bg-card">
        <div>
          <h1 className="text-2xl font-bold">Import & Export</h1>
          <p className="text-muted-foreground mt-1">
            Manage your task data efficiently.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <EnhancedImportExport />
      </div>
    </div>
  );
}