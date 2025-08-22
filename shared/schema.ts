// This file now only contains the TypeScript type definitions for your data.
// All Drizzle ORM and Zod schema generation has been removed to prevent errors,
// as this logic will be handled by the new Rust backend.

export type Task = {
  id: string;
  title: string;
  topic: string;
  date: string; // YYYY-MM-DD format
  time: string | null; // HH:MM format
  isDone: boolean;
  progress: number; // 0-100
  difficulty: "easy" | "medium" | "hard";
  orderIndex: number;
  focusSessions: number;
  createdAt: string | null;
};

export type FocusSession = {
  id: string;
  taskId: string | null;
  duration: number; // in minutes
  completedAt: string;
  sessionType: "focus" | "break";
};

export type Setting = {
  id: string;
  key: string;
  value: string;
};

// We keep a simplified InsertTask type for frontend forms.
// The full validation will happen in the Rust backend.
export type InsertTask = Omit<Task, 'id' | 'createdAt' | 'isDone' | 'progress' | 'focusSessions' | 'orderIndex'>;
