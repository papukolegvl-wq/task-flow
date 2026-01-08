import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus, ViewMode, Priority } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
    tasks: Task[];
    viewMode: ViewMode;
    searchQuery: string;
    selectedTaskId: string | null;

    // Actions
    createTask: (task: Partial<Task>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    setTaskStatus: (id: string, status: TaskStatus) => void;
    moveTask: (activeId: string, overId: string) => void; // For DnD
    setViewMode: (mode: ViewMode) => void;
    setSearchQuery: (query: string) => void;
    setSelectedTask: (id: string | null) => void;

    // Subtask management
    createSubtask: (parentId: string, task: Partial<Task>) => void;
    deleteSubtask: (parentId: string, subtaskId: string) => void;
    // Bulk Actions
    selectedTaskIds: string[];
    toggleTaskSelection: (id: string) => void;
    clearSelection: () => void;
    deleteTasks: (ids: string[]) => void;

    // Dependency management
    addDependency: (taskId: string, dependencyId: string) => void;
    removeDependency: (taskId: string, dependencyId: string) => void;

    // Helpers
    getTaskById: (id: string) => Task | undefined;
    getSubtasks: (parentId: string) => Task[];
}

const INITIAL_TASKS: Task[] = [
    {
        id: '1',
        title: 'Design System',
        description: 'Create a unified design system for the application including typography, colors, and components.',
        status: 'in_progress',
        priority: 'high',
        parentId: null,
        subtaskIds: ['2', '3'],
        dependencyIds: [],
        tags: ['design', 'ui'],
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        startDate: new Date().toISOString(),
        completedAt: null,
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Color Palette',
        description: 'Define primary, secondary, and neutral colors.',
        status: 'done',
        priority: 'medium',
        parentId: '1',
        subtaskIds: [],
        dependencyIds: [],
        tags: ['design'],
        dueDate: null,
        startDate: null,
        completedAt: new Date().toISOString(),
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'Typography',
        description: 'Select font families and define type scale.',
        status: 'in_progress',
        priority: 'high',
        parentId: '1',
        subtaskIds: [],
        dependencyIds: [],
        tags: ['design'],
        dueDate: null,
        startDate: null,
        completedAt: null,
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '4',
        title: 'Backend API',
        description: 'Implement REST API endpoints for task management.',
        status: 'backlog',
        priority: 'critical',
        parentId: null,
        subtaskIds: [],
        dependencyIds: ['1'], // Depends on design system? Maybe not, strictly.
        tags: ['backend', 'api'],
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        startDate: null,
        completedAt: null,
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: INITIAL_TASKS,
            viewMode: 'list',
            searchQuery: '',
            selectedTaskId: null,

            selectedTaskIds: [],

            toggleTaskSelection: (id) => set((state) => {
                const isSelected = state.selectedTaskIds.includes(id);
                return {
                    selectedTaskIds: isSelected
                        ? state.selectedTaskIds.filter((tid) => tid !== id)
                        : [...state.selectedTaskIds, id]
                };
            }),

            clearSelection: () => set({ selectedTaskIds: [] }),

            createTask: (task) => set((state) => {
                const newTask: Task = {
                    id: uuidv4(),
                    title: task.title || 'New Task',
                    description: task.description || '',
                    status: task.status || 'backlog',
                    priority: task.priority || 'medium',
                    parentId: task.parentId || null,
                    subtaskIds: [],
                    dependencyIds: task.dependencyIds || [],
                    tags: task.tags || [],
                    dueDate: task.dueDate || null,
                    startDate: task.startDate || null,
                    completedAt: null,
                    attachments: [],
                    comments: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...task
                };

                // If it has a parent, we need to update the parent's subtaskIds
                let newTasks = [...state.tasks, newTask];
                if (newTask.parentId) {
                    newTasks = newTasks.map(t =>
                        t.id === newTask.parentId
                            ? { ...t, subtaskIds: [...t.subtaskIds, newTask.id] }
                            : t
                    );
                }

                return { tasks: newTasks };
            }),

            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
            })),

            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id && t.parentId !== id), // Simple cascade delete for now
            })),

            setTaskStatus: (id, status) => set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)),
            })),

            deleteTasks: (ids) => set((state) => ({
                tasks: state.tasks.filter((t) => !ids.includes(t.id) && !ids.includes(t.parentId || '')),
            })),

            moveTask: (activeId, overId) => {
                // Complex logic for tree movement or list reordering
                // For now, let's just leave it empty or implement simple array swap if simple list
                console.log('Move task', activeId, overId);
            },

            setViewMode: (mode) => set({ viewMode: mode }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSelectedTask: (id) => set({ selectedTaskId: id }),

            // Subtask management
            createSubtask: (parentId, task) => {
                const state = get();
                const parent = state.tasks.find(t => t.id === parentId);
                if (!parent) return;

                const newTask: Task = {
                    id: uuidv4(),
                    title: task.title || 'New Subtask',
                    description: task.description || '',
                    status: task.status || 'backlog',
                    priority: task.priority || 'medium',
                    parentId: parentId,
                    subtaskIds: [],
                    dependencyIds: task.dependencyIds || [],
                    tags: task.tags || [],
                    dueDate: task.dueDate || null,
                    startDate: task.startDate || null,
                    completedAt: null,
                    attachments: [],
                    comments: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...task,
                    parentId: parentId
                };

                set({
                    tasks: [
                        ...state.tasks.map(t =>
                            t.id === parentId
                                ? { ...t, subtaskIds: [...t.subtaskIds, newTask.id] }
                                : t
                        ),
                        newTask
                    ]
                });
            },

            deleteSubtask: (parentId, subtaskId) => set((state) => ({
                tasks: state.tasks
                    .filter(t => t.id !== subtaskId)
                    .map(t => t.id === parentId
                        ? { ...t, subtaskIds: t.subtaskIds.filter(id => id !== subtaskId) }
                        : t
                    )
            })),

            // Dependency management
            addDependency: (taskId, dependencyId) => set((state) => ({
                tasks: state.tasks.map(t =>
                    t.id === taskId && !t.dependencyIds.includes(dependencyId)
                        ? { ...t, dependencyIds: [...t.dependencyIds, dependencyId], updatedAt: new Date().toISOString() }
                        : t
                )
            })),

            removeDependency: (taskId, dependencyId) => set((state) => ({
                tasks: state.tasks.map(t =>
                    t.id === taskId
                        ? { ...t, dependencyIds: t.dependencyIds.filter(id => id !== dependencyId), updatedAt: new Date().toISOString() }
                        : t
                )
            })),

            getTaskById: (id) => get().tasks.find((t) => t.id === id),
            getSubtasks: (parentId) => get().tasks.filter((t) => t.parentId === parentId),
        }),
        {
            name: 'taskflow-storage',
            partialize: (state) => ({
                tasks: state.tasks,
            }),
        }
    )
);
