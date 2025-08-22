import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "./settings-store";
import { apiRequest } from '@/lib/queryClient';

type SessionType = 'focus' | 'break';

interface FocusState {
  timeRemaining: number;
  sessionType: SessionType;
  isActive: boolean;
  currentTaskId: string | null;
  sessionsCompleted: number;
  sessionLength: number;
  breakLength: number;

  // Actions
  startSession: (taskId?: string) => void;
  togglePause: () => void;
  reset: () => void;
  tick: () => void;
  completeSession: () => void;
  stopAndLogSession: () => Promise<void>; // Return a promise
  setSessionLength: (minutes: number) => void;
  setBreakLength: (minutes: number) => void;
  syncTimeToSettings: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      timeRemaining: 25 * 60,
      sessionType: 'focus',
      isActive: false,
      currentTaskId: null,
      sessionsCompleted: 0,
      sessionLength: useSettingsStore.getState().sessionLength,
      breakLength: useSettingsStore.getState().breakLength,

      startSession: (taskId) => {
        const { sessionLength } = useSettingsStore.getState();
        set({
          isActive: true,
          timeRemaining: sessionLength * 60,
          sessionType: 'focus',
          currentTaskId: taskId || null,
          sessionLength: sessionLength,
        });
      },

      togglePause: () => set((state) => ({ isActive: !state.isActive })),

      reset: () => {
        const { sessionLength } = useSettingsStore.getState();
        set({
          isActive: false,
          timeRemaining: sessionLength * 60,
          sessionType: 'focus',
          currentTaskId: null,
        });
      },

      tick: () => {
        const { isActive, timeRemaining } = get();
        if (isActive && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (isActive && timeRemaining === 0) {
          get().completeSession();
        }
      },

      completeSession: async () => {
        const { sessionType, currentTaskId, sessionsCompleted, sessionLength } = get();
        const { breakLength } = useSettingsStore.getState();

        if (sessionType === 'focus') {
          try {
            const payload: { duration: number; sessionType: string; taskId?: string } = {
                duration: sessionLength,
                sessionType: 'focus',
            };
            if (currentTaskId) payload.taskId = currentTaskId;
            await apiRequest('POST', '/api/focus-sessions', payload);
          } catch (error) {
            console.error("Failed to save focus session:", error);
          }
        }

        const nextSessionType: SessionType = sessionType === 'focus' ? 'break' : 'focus';
        const nextDuration = (nextSessionType === 'focus' ? sessionLength : breakLength) * 60;

        set({
          isActive: true,
          sessionType: nextSessionType,
          timeRemaining: nextDuration,
          sessionsCompleted: sessionType === 'focus' ? sessionsCompleted + 1 : sessionsCompleted,
        });
      },
      
      stopAndLogSession: async () => {
        const { timeRemaining, sessionLength, currentTaskId, isActive } = get();
        
        if (!isActive || !currentTaskId) {
            get().reset();
            return;
        }

        const elapsedSeconds = (sessionLength * 60) - timeRemaining;
        const elapsedMinutes = Math.ceil(elapsedSeconds / 60);

        if (elapsedMinutes > 0) {
            try {
                // This now waits for the API request to finish
                await apiRequest('POST', '/api/focus-sessions', {
                  taskId: currentTaskId,
                  duration: elapsedMinutes,
                  sessionType: 'focus'
                });
            } catch (error) {
                console.error("Failed to save partial focus session:", error);
            }
        }
        
        get().reset();
      },

      setSessionLength: (minutes) => {
        const { isActive } = get();
        set({
          sessionLength: minutes,
          timeRemaining: isActive ? get().timeRemaining : minutes * 60,
        });
      },

      setBreakLength: (minutes) => set({ breakLength: minutes }),

      syncTimeToSettings: () => {
        const { isActive } = get();
        if (!isActive) {
          const { sessionLength } = useSettingsStore.getState();
          set({ 
            timeRemaining: sessionLength * 60,
            sessionLength: sessionLength
          });
        }
      }
    }),
    {
      name: "focus-store",
      partialize: (state) => ({
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);
