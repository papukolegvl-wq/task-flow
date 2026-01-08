import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskStatus, Task } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import './KanbanBoard.css';

const COLUMNS: { status: TaskStatus; title: string }[] = [
    { status: 'backlog', title: 'Бэклог' },
    { status: 'in_progress', title: 'В работе' },
    { status: 'waiting', title: 'Ожидание' },
    { status: 'done', title: 'Выполнено' },
    { status: 'blocked', title: 'Проблемы' },
];

export const KanbanBoard: React.FC = () => {
    const { tasks, setTaskStatus, setSelectedTask, searchQuery } = useTaskStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Filter tasks: only show parent tasks (not subtasks) and apply search
    const parentTasks = tasks.filter(task => !task.parentId);
    const filteredTasks = searchQuery
        ? parentTasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : parentTasks;

    // Group tasks by status
    const tasksByStatus = COLUMNS.reduce((acc, column) => {
        acc[column.status] = filteredTasks.filter(task => task.status === column.status);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id as string;
        let newStatus = over.id as TaskStatus;

        // Check if over.id is a value task status
        const isStatus = COLUMNS.some(col => col.status === newStatus);

        // If not a status, it means we dropped over another task
        if (!isStatus) {
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        // Update task status
        if (active.id !== over.id) {
            setTaskStatus(taskId, newStatus);
        }
        setActiveTask(null);
    };

    const handleTaskClick = (taskId: string) => {
        setSelectedTask(taskId);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                <div className="kanban-columns">
                    {COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.status}
                            status={column.status}
                            title={column.title}
                            tasks={tasksByStatus[column.status]}
                            onTaskClick={handleTaskClick}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="kanban-card-overlay">
                        <KanbanCard task={activeTask} onClick={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
