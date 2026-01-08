import { Task } from '../types';
import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for conditional className joining
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Filter tasks by search query
 */
export const filterTasksByQuery = (tasks: Task[], query: string): Task[] => {
    if (!query.trim()) return tasks;

    const lowerQuery = query.toLowerCase();

    return tasks.filter((task) => {
        return (
            task.title.toLowerCase().includes(lowerQuery) ||
            task.description.toLowerCase().includes(lowerQuery) ||
            task.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
    });
};

/**
 * Calculate task completion percentage
 */
export const calculateTaskProgress = (task: Task, allTasks: Task[]): number => {
    if (task.subtaskIds.length === 0) {
        return task.status === 'done' ? 100 : 0;
    }

    const subtasks = allTasks.filter((t) => task.subtaskIds.includes(t.id));
    const completedSubtasks = subtasks.filter((t) => t.status === 'done').length;

    return Math.round((completedSubtasks / subtasks.length) * 100);
};

/**
 * Check if task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
};

/**
 * Format date to relative string
 */
export const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    if (diffDays === -1) return 'Вчера';
    if (diffDays > 1 && diffDays < 7) return `Через ${diffDays} дн.`;
    if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} дн. назад`;

    return date.toLocaleDateString('ru-RU');
};

/**
 * Check if all dependencies are completed
 */
export const areDependenciesMet = (task: Task, allTasks: Task[]): boolean => {
    if (task.dependencyIds.length === 0) return true;

    const dependencies = allTasks.filter((t) => task.dependencyIds.includes(t.id));
    return dependencies.every((dep) => dep.status === 'done');
};

/**
 * Get all subtasks recursively
 */
export const getAllSubtasks = (taskId: string, allTasks: Task[]): Task[] => {
    const directSubtasks = allTasks.filter((t) => t.parentId === taskId);
    const nestedSubtasks = directSubtasks.flatMap((subtask) => getAllSubtasks(subtask.id, allTasks));

    return [...directSubtasks, ...nestedSubtasks];
};
