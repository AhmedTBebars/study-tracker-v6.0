import React from 'react';
import { FocusColor } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

interface CircularTimerProps {
  timeRemaining: number;
  totalDuration: number;
  sessionType: 'focus' | 'break';
  color?: FocusColor;
}

// Helper function to format time from seconds to MM:SS
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Color classes mapping
const colorClasses: Record<FocusColor, string> = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
};

export function CircularTimer({ 
  timeRemaining, 
  totalDuration, 
  sessionType, 
  color = 'blue' 
}: CircularTimerProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (timeRemaining / totalDuration) : 1;
  const strokeDashoffset = circumference * (1 - progress);

  // Use custom color for focus sessions, green for breaks
  const timerColorClass = sessionType === 'focus' ? colorClasses[color] : 'text-green-500';

  return (
    <div className="relative w-64 h-64">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        {/* Background Circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-muted opacity-20"
        />
        {/* Progress Circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          className={cn(timerColorClass, "transition-all duration-1000")}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-5xl font-bold font-mono tabular-nums tracking-tighter">
          {formatTime(timeRemaining)}
        </p>
        <p className="mt-2 text-lg font-semibold uppercase tracking-widest text-muted-foreground">
          {sessionType}
        </p>
      </div>
    </div>
  );
}