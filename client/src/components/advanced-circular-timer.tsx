import React from 'react';
import { FocusColor } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

interface AdvancedCircularTimerProps {
  timeRemaining: number;
  totalDuration: number;
  sessionType: 'focus' | 'break';
  color?: FocusColor;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return { mins, secs };
};

const colorClasses: Record<FocusColor, { stroke: string; text: string; glow: string }> = {
  blue: { stroke: 'stroke-blue-500', text: 'text-blue-500', glow: '[filter:drop-shadow(0_0_6px_rgba(59,130,246,0.7))]' },
  green: { stroke: 'stroke-green-500', text: 'text-green-500', glow: '[filter:drop-shadow(0_0_6px_rgba(34,197,94,0.7))]' },
  orange: { stroke: 'stroke-orange-500', text: 'text-orange-500', glow: '[filter:drop-shadow(0_0_6px_rgba(249,115,22,0.7))]' },
  red: { stroke: 'stroke-red-500', text: 'text-red-500', glow: '[filter:drop-shadow(0_0_6px_rgba(239,68,68,0.7))]' },
};

export function AdvancedCircularTimer({ 
  timeRemaining, 
  totalDuration, 
  sessionType, 
  color = 'blue' 
}: AdvancedCircularTimerProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (timeRemaining / totalDuration) : 1;
  const strokeDashoffset = circumference * (1 - progress);

  const timerColor = sessionType === 'focus' ? colorClasses[color] : { stroke: 'stroke-green-500', text: 'text-green-500', glow: '[filter:drop-shadow(0_0_6px_rgba(34,197,94,0.7))]' };
  const { mins, secs } = formatTime(timeRemaining);

  const segments = 30;

  return (
    // --- DESIGN CHANGE: Increased size to w-96 h-96 for better proportion ---
    <div className="relative w-96 h-96">
      <svg className="w-full h-full transform -rotate-90" viewBox="-20 -20 240 240">
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          className="text-muted/20"
          strokeDasharray={`${circumference / segments - 2} 2`}
          strokeLinecap="round"
        />
        
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          className={cn(timerColor.stroke, timerColor.glow)}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />

        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          strokeLinecap="round"
          className={cn(timerColor.stroke)}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          {/* --- DESIGN CHANGE: Adjusted font sizes for new container size --- */}
          <span className="text-7xl font-bold font-sans tracking-tight">{String(mins).padStart(2, '0')}</span>
          <span className="text-2xl font-semibold text-muted-foreground ml-1">min</span>
          <span className="text-7xl font-bold font-sans tracking-tight ml-3">{String(secs).padStart(2, '0')}</span>
          <span className="text-2xl font-semibold text-muted-foreground ml-1">sec</span>
        </div>
        <p className={cn("mt-2 text-lg font-semibold uppercase tracking-widest", timerColor.text)}>
          {sessionType}
        </p>
      </div>
    </div>
  );
}
