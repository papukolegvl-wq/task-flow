import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    status: TaskStatus;
    title: string;
    tasks: Task[];
    onTaskClick: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    title,
    tasks,
    onTaskClick,
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div className={`kanban-column ${isOver ? 'over' : ''}`}>
            <div className="kanban-column-header">
                <h3 className="kanban-column-title">{title}</h3>
                <span className="kanban-column-count">{tasks.length}</span>
            </div>

            <div ref={setNodeRef} className="kanban-column-content">
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 ? (
                        <div className="kanban-column-empty">
                            Нет задач
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <KanbanCard
                                key={task.id}
                                task={task}
                                onClick={() => onTaskClick(task.id)}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
};
