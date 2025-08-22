import { CalendarHeatmap } from "@/components/calendar-heatmap";

export default function Calendar() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Productivity Calendar</h1>
            <p className="text-muted-foreground mt-1">
              Visual timeline of your productivity and progress
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <CalendarHeatmap />
      </div>
    </div>
  );
}