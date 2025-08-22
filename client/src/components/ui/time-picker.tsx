import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value: string; // "HH:mm" format
  onChange: (time: string) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const periods = ["AM", "PM"];

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hour, minute, period] = React.useMemo(() => {
    const [h, m] = value.split(':');
    let hour12 = parseInt(h, 10);
    const p = hour12 >= 12 ? "PM" : "AM";
    hour12 = hour12 % 12 || 12;
    return [String(hour12).padStart(2, '0'), m, p];
  }, [value]);

  const handleTimeChange = (newPart: { h?: string, m?: string, p?: string }) => {
    const newHour12 = newPart.h || hour;
    const newMinute = newPart.m || minute;
    const newPeriod = newPart.p || period;

    let newHour24 = parseInt(newHour12, 10);

    if (newPeriod === 'PM' && newHour24 < 12) {
      newHour24 += 12;
    }
    if (newPeriod === 'AM' && newHour24 === 12) { // Midnight case
      newHour24 = 0;
    }

    onChange(`${String(newHour24).padStart(2, '0')}:${newMinute}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
          <Clock className="mr-2 h-4 w-4" />
          <span>{`${hour}:${minute} ${period}`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex p-2">
          <div className="flex flex-col h-48 overflow-y-auto custom-scrollbar pr-2 border-r">
            {hours.map(h => (
              <Button key={h} variant={h === hour ? "default" : "ghost"} onClick={() => handleTimeChange({ h })}>{h}</Button>
            ))}
          </div>
          <div className="flex flex-col h-48 overflow-y-auto custom-scrollbar px-2 border-r">
            {minutes.map(m => (
              <Button key={m} variant={m === minute ? "default" : "ghost"} onClick={() => handleTimeChange({ m })}>{m}</Button>
            ))}
          </div>
          <div className="flex flex-col justify-center px-2 space-y-2">
            {periods.map(p => (
              <Button key={p} variant={p === period ? "default" : "ghost"} onClick={() => handleTimeChange({ p })}>{p}</Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
