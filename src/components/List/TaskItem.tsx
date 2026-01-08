import React from 'react';
import { Task } from '../../types';
import { Badge } from '../ui';
import { ChevronRight, ChevronDown, CheckCircle2, Circle, Clock, AlertTriangle, Link2 } from 'lucide-react';
import './TaskItem.css';

interface TaskItemProps {
    task: Task;
    onClick: () => void;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    hasSubtasks?: boolean;
    depth?: number;
    isLast?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
    backlog: <Circle size={16} />,
    in_progress: <Clock size={16} />,
    waiting: <AlertTriangle size={16} />,
    done: <CheckCircle2 size={16} />,
    blocked: <AlertTriangle size={16} />,
    canceled: <Circle size={16} />,
};

const STATUS_LABELS: Record<string, string> = {
    backlog: 'Бэклог',
    in_progress: 'В работе',
    waiting: 'Ожидание',
    done: 'Выполнена',
    blocked: 'Есть сложность',
    canceled: 'Отменена',
};

const PRIORITY_LABELS: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критичный',
};

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    onClick,
    isExpanded = false,
    onToggleExpand,
    hasSubtasks = false,
    depth = 0,
    isLast = false,
    isSelected = false,
    onToggleSelect,
}) => {
    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpand?.();
    };

    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelect?.();
    };

    return (
        <div
            className={`task-item task-item-depth-${depth} task-priority-${task.priority} ${isLast ? 'is-last' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            style={{
                marginLeft: `${depth * 2}rem`,
                width: `calc(100% - ${depth * 2}rem)`
            }}
        >
            {depth > 0 && (
                <div className="task-tree-connector" />
            )}

            <button
                type="button"
                className={`task-checkbox ${isSelected ? 'checked' : ''}`}
                onClick={handleSelectClick}
                aria-label="Select task"
            >
                {isSelected && <CheckCircle2 size={14} style={{ color: 'white' }} />}
            </button>

            <div className="task-item-content">
                {hasSubtasks ? (
                    <button className="task-expand-btn" onClick={handleExpandClick}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : (
                    <div className="task-expand-placeholder" />
                )}

                <div className={`task-status-icon task-status-${task.status}`}>
                    {STATUS_ICONS[task.status]}
                </div>

                <div className="task-item-main">
                    <div className="task-item-header">
                        <h3 className="task-title">{task.title}</h3>
                        <div className="task-badges">
                            <Badge variant={task.status}>{STATUS_LABELS[task.status]}</Badge>
                            <Badge variant={task.priority}>{PRIORITY_LABELS[task.priority]}</Badge>
                        </div>
                    </div>



                    <div className="task-meta">
                        {task.dueDate && (
                            <span className="task-meta-item">
                                <Clock size={14} />
                                {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                            </span>
                        )}
                        {task.dependencyIds.length > 0 && (
                            <span className="task-meta-item">
                                <Link2 size={14} />
                                {task.dependencyIds.length} зависимост{task.dependencyIds.length === 1 ? 'ь' : 'и'}
                            </span>
                        )}
                        {task.tags.map((tag) => (
                            <Badge key={tag} variant="default">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
