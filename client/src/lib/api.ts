import { invoke } from '@tauri-apps/api/tauri';
import { type Task, type InsertTask } from '@shared/schema';

/**
 * Fetches all tasks scheduled for the current day.
 * This function calls the `get_todays_tasks` command in the Rust backend.
 * @returns A promise that resolves to an array of Task objects.
 */
export function getTodaysTasks(): Promise<Task[]> {
  return invoke('get_todays_tasks');
}

/**
 * Creates a new task in the database.
 * This function calls the `add_task` command in the Rust backend.
 * @param taskData - The details of the task to create.
 * @returns A promise that resolves to the newly created Task object.
 */
export function addTask(taskData: InsertTask): Promise<Task> {
  return invoke('add_task', { ...taskData });
}
