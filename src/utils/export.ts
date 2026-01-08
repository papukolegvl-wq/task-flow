import { Task } from '../types';

/**
 * Export tasks to JSON format
 */
export const exportToJSON = (tasks: Task[]): string => {
    return JSON.stringify(tasks, null, 2);
};

/**
 * Export tasks to Markdown format
 */
export const exportToMarkdown = (tasks: Task[]): string => {
    const rootTasks = tasks.filter((t) => !t.parentId);

    const renderTask = (task: Task, level = 0): string => {
        const indent = '  '.repeat(level);
        const checkbox = task.status === 'done' ? '[x]' : '[ ]';
        const priority = task.priority !== 'medium' ? ` **${task.priority}**` : '';
        const tags = task.tags.length > 0 ? ` \`${task.tags.join('`, `')}\`` : '';
        const dueDate = task.dueDate ? ` 📅 ${new Date(task.dueDate).toLocaleDateString('ru-RU')}` : '';

        let md = `${indent}- ${checkbox} **${task.title}**${priority}${tags}${dueDate}\n`;

        if (task.description) {
            md += `${indent}  > ${task.description}\n`;
        }

        const subtasks = tasks.filter((t) => t.parentId === task.id);
        subtasks.forEach((subtask) => {
            md += renderTask(subtask, level + 1);
        });

        return md;
    };

    let markdown = '# TaskFlow - Экспорт задач\n\n';
    rootTasks.forEach((task) => {
        markdown += renderTask(task);
    });

    return markdown;
};

/**
 * Export tasks to plain text
 */
export const exportToText = (tasks: Task[]): string => {
    const rootTasks = tasks.filter((t) => !t.parentId);

    const renderTask = (task: Task, level = 0): string => {
        const indent = '  '.repeat(level);
        const status = task.status === 'done' ? '✓' : '○';
        const priority = `[${task.priority.toUpperCase()}]`;

        let text = `${indent}${status} ${task.title} ${priority}\n`;

        if (task.description) {
            text += `${indent}   ${task.description}\n`;
        }

        const subtasks = tasks.filter((t) => t.parentId === task.id);
        subtasks.forEach((subtask) => {
            text += renderTask(subtask, level + 1);
        });

        return text;
    };

    let text = 'TASKFLOW - СПИСОК ЗАДАЧ\n';
    text += '='.repeat(50) + '\n\n';

    rootTasks.forEach((task) => {
        text += renderTask(task);
    });

    return text;
};

/**
 * Download content as file
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
