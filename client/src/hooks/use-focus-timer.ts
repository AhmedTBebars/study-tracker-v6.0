import { useEffect } from "react";
import { useFocusStore } from "@/stores/focus-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useFocusTimer() {
  const {
    isRunning,
    timeLeft,
    sessionLength,
    breakLength,
    currentTaskId,
    startSession,
    pauseSession,
    resetSession,
    completeSession,
    setSessionLength,
    setBreakLength,
  } = useFocusStore();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFocusSessionMutation = useMutation({
    mutationFn: async (data: {
      taskId?: string;
      duration: number;
      sessionType: "focus" | "break";
    }) => {
      return apiRequest("POST", "/api/focus-sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // عندما ينتهي المؤقت (timeLeft يصل للصفر)
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
  }, [timeLeft, isRunning]);

  const handleSessionComplete = async () => {
    completeSession();

    await createFocusSessionMutation.mutateAsync({
      taskId: currentTaskId || undefined,
      duration: sessionLength,
      sessionType: "focus",
    });

    toast({
      title: "Focus session completed! 🎉",
      description: `Great job! Time for a ${breakLength}-minute break.`,
    });

    if (
      window.confirm(
        `Focus session completed! Start a ${breakLength}-minute break?`
      )
    ) {
      startBreak();
    }
  };

  const startBreak = () => {
    const breakTime = breakLength * 60;
    useFocusStore.setState({
      isRunning: true,
      timeLeft: breakTime,
      lastSessionType: "break",
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = (): number => {
    const totalTime = sessionLength * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return {
    isRunning,
    timeLeft,
    sessionLength,
    breakLength,
    currentTaskId,
    progress: getProgress(),
    formattedTime: formatTime(timeLeft),
    startSession,
    pauseSession,
    resetSession,
    setSessionLength,
    setBreakLength,
    isCreatingSession: createFocusSessionMutation.isPending,
  };
}
