import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFocusTimer } from "@/hooks/use-focus-timer";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Palette,
  Coffee,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FocusTimerProps {
  taskId?: string;
  className?: string;
  taskTitle?: string;
}

const colorSchemes = {
  blue: {
    primary: "stroke-blue-500",
    bg: "stroke-blue-100 dark:stroke-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    primary: "stroke-green-500",
    bg: "stroke-green-100 dark:stroke-green-900/30",
    text: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-green-600",
  },
  purple: {
    primary: "stroke-purple-500",
    bg: "stroke-purple-100 dark:stroke-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-purple-600",
  },
  orange: {
    primary: "stroke-orange-500",
    bg: "stroke-orange-100 dark:stroke-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-orange-600",
  },
  red: {
    primary: "stroke-red-500",
    bg: "stroke-red-100 dark:stroke-red-900/30",
    text: "text-red-600 dark:text-red-400",
    gradient: "from-red-500 to-red-600",
  },
};

export function FocusTimer({ taskId, className, taskTitle }: FocusTimerProps) {
  const {
    isRunning,
    timeLeft,
    sessionLength,
    breakLength,
    progress,
    formattedTime,
    startSession,
    pauseSession,
    resetSession,
    setSessionLength,
    setBreakLength,
  } = useFocusTimer();

  // حل الخطأ: قيم ابتدائية صحيحة
  const [selectedSessionLength, setSelectedSessionLength] = useState(
    sessionLength?.toString() || "25"
  );
  const [selectedBreakLength, setSelectedBreakLength] = useState(
    breakLength?.toString() || "5"
  );
  const [selectedColorScheme, setSelectedColorScheme] =
    useState<keyof typeof colorSchemes>("blue");

  const handleStart = () => {
    startSession(taskId);
  };

  const handleSessionLengthChange = (value: string) => {
    setSelectedSessionLength(value);
    setSessionLength(parseInt(value));
  };

  const handleBreakLengthChange = (value: string) => {
    setSelectedBreakLength(value);
    setBreakLength(parseInt(value));
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const currentScheme = colorSchemes[selectedColorScheme];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: isRunning ? 360 : 0 }}
              transition={{
                duration: 2,
                repeat: isRunning ? Infinity : 0,
                ease: "linear",
              }}
            >
              <Timer className="w-5 h-5" />
            </motion.div>
            Focus Session
          </CardTitle>
          {taskTitle && (
            <Badge variant="outline" className="mx-auto w-fit">
              {taskTitle}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-8 pt-4">
          <div className="text-center">
            {/* Color Scheme Selector */}
            <div className="flex justify-center items-center gap-2 mb-6">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1">
                {Object.keys(colorSchemes).map((scheme) => (
                  <motion.button
                    key={scheme}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setSelectedColorScheme(
                        scheme as keyof typeof colorSchemes
                      )
                    }
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      selectedColorScheme === scheme
                        ? "border-foreground scale-110"
                        : "border-muted",
                      scheme === "blue" && "bg-blue-500",
                      scheme === "green" && "bg-green-500",
                      scheme === "purple" && "bg-purple-500",
                      scheme === "orange" && "bg-orange-500",
                      scheme === "red" && "bg-red-500"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Circular Timer */}
            <motion.div
              className="relative mx-auto w-64 h-64 mb-8"
              animate={{
                filter: isRunning
                  ? "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
                  : "none",
              }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="w-64 h-64 transform -rotate-90"
                viewBox="0 0 200 200"
                aria-label={`Focus timer: ${formattedTime} remaining`}
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  strokeWidth="8"
                  fill="none"
                  className={currentScheme.bg}
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r={radius}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={currentScheme.primary}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className={cn(
                    "text-4xl font-mono font-bold mb-2",
                    currentScheme.text
                  )}
                  animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                >
                  {formattedTime}
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isRunning ? "active" : "ready"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-muted-foreground flex items-center gap-1"
                  >
                    {isRunning ? (
                      <>
                        <Zap className="w-3 h-3" />
                        Focus session active
                      </>
                    ) : (
                      <>
                        <Coffee className="w-3 h-3" />
                        Ready to focus
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <AnimatePresence mode="wait">
                {!isRunning ? (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className={cn(
                        "px-8 py-3 flex items-center space-x-2 bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all",
                        `bg-gradient-to-r ${currentScheme.gradient}`
                      )}
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Focus</span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex gap-3"
                  >
                    <Button
                      onClick={pauseSession}
                      variant="outline"
                      className="px-6 py-3 flex items-center space-x-2"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </Button>
                    <Button
                      onClick={resetSession}
                      variant="outline"
                      className="px-6 py-3 flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Session Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session Length</span>
                <Select
                  value={selectedSessionLength}
                  onValueChange={handleSessionLengthChange}
                  disabled={isRunning}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Break Length</span>
                <Select
                  value={selectedBreakLength}
                  onValueChange={handleBreakLengthChange}
                  disabled={isRunning}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select break" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
