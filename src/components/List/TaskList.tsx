import { useState, useMemo, useEffect } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { Trash2, X } from 'lucide-react';
import './TaskList.css';

export const TaskList: React.FC = () => {
    const {
        tasks,
        setSelectedTask,
        searchQuery,
        selectedTaskIds,
        toggleTaskSelection,
        deleteTasks,
        clearSelection
    } = useTaskStore();
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    // 1. Build a map of child -> parent for easy traversal
    const parentMap = useMemo(() => {
        const map = new Map<string, string>();
        tasks.forEach(t => {
            if (t.parentId) map.set(t.id, t.parentId);
        });
        return map;
    }, [tasks]);

    // 2. Perform Search & Tree Filtering
    const searchResult = useMemo(() => {
        if (!searchQuery.trim()) {
            return {
                visibleIds: new Set(tasks.map(t => t.id)),
                forceExpandedIds: new Set<string>()
            };
        }

        const query = searchQuery.toLowerCase();
        const matches = tasks.filter(t =>
            t.title.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query) ||
            t.tags.some(tag => tag.toLowerCase().includes(query))
        );

        const visibleIds = new Set<string>();
        const forceExpandedIds = new Set<string>();

        matches.forEach(task => {
            visibleIds.add(task.id);

            // Walk up the tree and make ancestors visible & expanded
            let currentId = task.id;
            while (parentMap.has(currentId)) {
                const parentId = parentMap.get(currentId)!;
                visibleIds.add(parentId);
                forceExpandedIds.add(parentId);
                currentId = parentId;
            }
        });

        return { visibleIds, forceExpandedIds };
    }, [tasks, searchQuery, parentMap]);

    // 3. Update expanded state when search changes
    useEffect(() => {
        if (searchQuery.trim()) {
            setExpandedTasks(prev => {
                const next = new Set(prev);
                searchResult.forceExpandedIds.forEach(id => next.add(id));
                return next;
            });
        }
    }, [searchResult.forceExpandedIds, searchQuery]);

    const rootTasks = tasks.filter((t) => !t.parentId && searchResult.visibleIds.has(t.id));
    const noResults = searchQuery && rootTasks.length === 0;

    const toggleExpand = (taskId: string) => {
        setExpandedTasks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = () => {
        if (confirm(`Вы уверены, что хотите удалить ${selectedTaskIds.length} задач?`)) {
            deleteTasks(selectedTaskIds);
            clearSelection();
        }
    };

    const renderTask = (task: typeof tasks[0], depth = 0, isLast = false): React.ReactNode => {
        const hasSubtasks = task.subtaskIds.length > 0;

        // Find visible subtasks
        const visibleSubtasks = hasSubtasks
            ? task.subtaskIds
                .map(id => tasks.find(t => t.id === id))
                .filter(t => t && searchResult.visibleIds.has(t.id)) as typeof tasks
            : [];

        const isExpanded = expandedTasks.has(task.id);
        const isSelected = selectedTaskIds.includes(task.id);

        return (
            <div key={task.id} className="task-tree-node">
                <TaskItem
                    task={task}
                    onClick={() => setSelectedTask(task.id)}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleExpand(task.id)}
                    hasSubtasks={visibleSubtasks.length > 0} // Only show chevron if visible subtasks exist
                    depth={depth}
                    isLast={isLast}
                    isSelected={isSelected}
                    onToggleSelect={() => toggleTaskSelection(task.id)}
                />

                {isExpanded && visibleSubtasks.length > 0 && (
                    <div className="task-subtasks-container">
                        {visibleSubtasks.map((subtask, index) =>
                            renderTask(subtask, depth + 1, index === visibleSubtasks.length - 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    // 4. Calculate Density
    // We base density on the number of visible items (roots + visible children would be ideal, 
    // but just roots is a good stability proxy, or total visible if we want strictness).
    // Let's use total *visible* tasks (roots) for stability, or `tasks.length` if we want consistent UI?
    // User wants "more tasks = more compact".
    // Let's use visible root tasks count for now, as that drives the main list length initially.
    const density = rootTasks.length < 5 ? 'relaxed'
        : rootTasks.length < 12 ? 'normal'
            : 'compact';

    return (
        <>
            <div className="task-list" data-density={density}>
                {noResults ? (
                    <div className="task-list-empty">
                        <p>Ничего не найдено по запросу "{searchQuery}"</p>
                    </div>
                ) : rootTasks.length === 0 ? (
                    <div className="task-list-empty">
                        <p>Нет задач. Создайте первую задачу!</p>
                    </div>
                ) : (
                    rootTasks.map((task, index) => renderTask(task, 0, index === rootTasks.length - 1))
                )}
            </div>

            {selectedTaskIds.length > 0 && (
                <div className="bulk-actions-bar">
                    <div className="bulk-actions-info">
                        <span className="bulk-count">Выбрано: {selectedTaskIds.length}</span>
                        <button className="bulk-clear-btn" onClick={clearSelection} title="Снять выделение">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="bulk-actions-buttons">
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={handleDeleteSelected}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Trash2 size={16} />
                            Удалить
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
