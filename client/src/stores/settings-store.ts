import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type FocusColor = 'blue' | 'green' | 'orange' | 'red';
export type AppTheme = 'light' | 'dark';
export type NotificationFrequency = 'low' | 'medium' | 'high';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

interface SettingsState {
  theme: AppTheme;
  focusTimerColor: FocusColor;
  sessionLength: number;
  breakLength: number;
  notificationsEnabled: boolean;
  morningTime: string;
  eveningTime: string;
  focusBreaksNotificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  dailyGoalUpdates: boolean;
  streakMilestones: boolean;
  overdueAlerts: boolean;
  soundAlerts: boolean;
  // --- 1. إضافة إعدادات الاستيراد الجديدة للحالة ---
  importSkipDuplicates: boolean;
  importDefaultTime: string;
  importAutoComplete: boolean;
  importMarkDifficulty: TaskDifficulty;
  
  // دوال التحديث
  setTheme: (theme: AppTheme) => void;
  setFocusTimerColor: (color: FocusColor) => void;
  setSessionLength: (length: number) => void;
  setBreakLength: (length: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setMorningTime: (time: string) => void;
  setEveningTime: (time: string) => void;
  setFocusBreaksNotificationsEnabled: (enabled: boolean) => void;
  setNotificationFrequency: (freq: NotificationFrequency) => void;
  setDailyGoalUpdates: (enabled: boolean) => void;
  setStreakMilestones: (enabled: boolean) => void;
  setOverdueAlerts: (enabled: boolean) => void;
  setSoundAlerts: (enabled: boolean) => void;
  // --- 2. إضافة دوال التحديث الجديدة ---
  setImportSkipDuplicates: (enabled: boolean) => void;
  setImportDefaultTime: (time: string) => void;
  setImportAutoComplete: (enabled: boolean) => void;
  setImportMarkDifficulty: (difficulty: TaskDifficulty) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // القيم الافتراضية
      theme: 'light',
      focusTimerColor: 'blue',
      sessionLength: 25,
      breakLength: 5,
      notificationsEnabled: true,
      morningTime: '09:00',
      eveningTime: '18:00',
      focusBreaksNotificationsEnabled: true,
      notificationFrequency: 'medium',
      dailyGoalUpdates: true,
      streakMilestones: true,
      overdueAlerts: true,
      soundAlerts: false,
      // القيم الافتراضية لإعدادات الاستيراد
      importSkipDuplicates: true,
      importDefaultTime: "09:00",
      importAutoComplete: false,
      importMarkDifficulty: "medium",

      // دوال التحديث
      setTheme: (theme) => set({ theme }),
      setFocusTimerColor: (color) => set({ focusTimerColor: color }),
      setSessionLength: (length) => set({ sessionLength: length }),
      setBreakLength: (length) => set({ breakLength: length }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setMorningTime: (time) => set({ morningTime: time }),
      setEveningTime: (time) => set({ eveningTime: time }),
      setFocusBreaksNotificationsEnabled: (enabled) => set({ focusBreaksNotificationsEnabled: enabled }),
      setNotificationFrequency: (freq) => set({ notificationFrequency: freq }),
      setDailyGoalUpdates: (enabled) => set({ dailyGoalUpdates: enabled }),
      setStreakMilestones: (enabled) => set({ streakMilestones: enabled }),
      setOverdueAlerts: (enabled) => set({ overdueAlerts: enabled }),
      setSoundAlerts: (enabled) => set({ soundAlerts: enabled }),
      setImportSkipDuplicates: (enabled) => set({ importSkipDuplicates: enabled }),
      setImportDefaultTime: (time) => set({ importDefaultTime: time }),
      setImportAutoComplete: (enabled) => set({ importAutoComplete: enabled }),
      setImportMarkDifficulty: (difficulty) => set({ importMarkDifficulty: difficulty }),
    }),
    {
      name: 'study-tracker-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);