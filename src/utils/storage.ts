import { Task } from '../types';

const STORAGE_KEY = 'taskflow_tasks';

/**
 * Load tasks from localStorage
 */
export const loadTasksFromStorage = (): Task[] | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const tasks = JSON.parse(stored);
        return Array.isArray(tasks) ? tasks : null;
    } catch (error) {
        console.error('Error loading tasks from storage:', error);
        return null;
    }
};

/**
 * Save tasks to localStorage
 */
export const saveTasksToStorage = (tasks: Task[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to storage:', error);
    }
};

/**
 * Clear all tasks from storage
 */
export const clearStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
};
