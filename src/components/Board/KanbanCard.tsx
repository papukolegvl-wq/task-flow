import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { GripVertical, Link2, Calendar, CheckSquare } from 'lucide-react';

interface KanbanCardProps {
    task: Task;
    onClick: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick }) => {
    const { getSubtasks } = useTaskStore();
    const subtasks = getSubtasks(task.id);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Calculate subtask stats
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(st => st.status === 'done').length;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card ${isDragging ? 'dragging' : ''}`}
            onClick={onClick}
        >
            <div className="kanban-card-header">
                <span className={`kanban-priority-dot priority-${task.priority}`} title={`Priority: ${task.priority}`} />
                <h4 className="kanban-card-title">{task.title}</h4>
                <div className="kanban-card-drag-handle" {...attributes} {...listeners}>
                    <GripVertical size={14} />
                </div>
            </div>

            <div className="kanban-card-body">
                {task.tags.length > 0 && (
                    <div className="kanban-card-tags">
                        {task.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="kanban-tag-mini">
                                {tag}
                            </span>
                        ))}
                        {task.tags.length > 3 && (
                            <span className="kanban-tag-more">+{task.tags.length - 3}</span>
                        )}
                    </div>
                )}

                <div className="kanban-card-footer">
                    <div className="kanban-card-meta-group">
                        {totalSubtasks > 0 && (
                            <div className="kanban-meta-item" title="Subtasks progress">
                                <CheckSquare size={12} />
                                <span className="subtasks-text">{completedSubtasks}/{totalSubtasks}</span>
                                <div className="mini-progress-bar">
                                    <div
                                        className="mini-progress-fill"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {task.dependencyIds.length > 0 && (
                            <div className="kanban-meta-item" title="Dependencies">
                                <Link2 size={12} />
                                <span>{task.dependencyIds.length}</span>
                            </div>
                        )}
                    </div>

                    {task.dueDate && (
                        <div className="kanban-meta-item date-badge">
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
