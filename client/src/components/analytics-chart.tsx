import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from "recharts";
import { TrendingUp, Timer, Target, Calendar } from "lucide-react";

interface AnalyticsChartProps {
  type: "daily" | "weekly" | "monthly" | "focus-distribution" | "productivity-heatmap";
  data: any[];
  title: string;
  className?: string;
}

const COLORS = {
  primary: "hsl(239, 84%, 67%)",
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(38, 92%, 50%)",
  error: "hsl(0, 84.2%, 60.2%)",
  muted: "hsl(240, 5%, 64.9%)",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  "hsl(262, 83%, 58%)",
  "hsl(196, 100%, 47%)",
];

export function AnalyticsChart({ type, data, title, className }: AnalyticsChartProps) {
  const renderChart = () => {
    switch (type) {
      case "daily":
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted opacity-20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke={COLORS.primary}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 * (1 - (data[0]?.value || 0) / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">{data[0]?.value || 0}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>
            </div>
            <div className="w-full space-y-3">
              {data.slice(1).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "weekly":
      case "monthly":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="fill-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="fill-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem"
                }}
              />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
                className="transition-all duration-300 hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "focus-distribution":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case "productivity-heatmap":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {/* Day labels */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs text-muted-foreground text-center py-2">
                  {day}
                </div>
              ))}
              
              {/* Heatmap cells */}
              {data.map((item, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded transition-all duration-200 hover:scale-110 cursor-pointer ${
                    item.value === 0 
                      ? "bg-muted" 
                      : item.value < 25 
                      ? "bg-success/20" 
                      : item.value < 50 
                      ? "bg-success/40" 
                      : item.value < 75 
                      ? "bg-success/60" 
                      : "bg-success/80"
                  }`}
                  title={`${item.date}: ${item.value}% productivity`}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center space-x-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded ${
                      level === 0 
                        ? "bg-muted" 
                        : level === 1 
                        ? "bg-success/20" 
                        : level === 2 
                        ? "bg-success/40" 
                        : level === 3 
                        ? "bg-success/60" 
                        : "bg-success/80"
                    }`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        );

      default:
        return <div className="text-center text-muted-foreground">Chart type not supported</div>;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "daily":
        return <Target className="w-5 h-5" />;
      case "weekly":
      case "monthly":
        return <TrendingUp className="w-5 h-5" />;
      case "focus-distribution":
        return <Timer className="w-5 h-5" />;
      case "productivity-heatmap":
        return <Calendar className="w-5 h-5" />;
      default:
        return <BarChart className="w-5 h-5" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
