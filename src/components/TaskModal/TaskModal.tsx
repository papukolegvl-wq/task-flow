import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Modal, Input, Button, Badge } from '../ui';
import { useTaskStore } from '../../store/useTaskStore';
import { Task, Priority, TaskStatus } from '../../types';
import { Calendar, Tag, Link2, Trash2, Plus, X } from 'lucide-react';
import './TaskModal.css';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId?: string | null;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'backlog', label: 'Бэклог' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'waiting', label: 'Ожидание' },
    { value: 'done', label: 'Выполнена' },
    { value: 'blocked', label: 'Есть сложность' },
    { value: 'canceled', label: 'Отменена' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критичный' },
];

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId }) => {
    const { tasks, createTask, updateTask, deleteTask, createSubtask, deleteSubtask, addDependency, removeDependency, getSubtasks } = useTaskStore();
    const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

    const [title, setTitle] = useState(existingTask?.title || '');
    const [description, setDescription] = useState(existingTask?.description || '');
    const [status, setStatus] = useState<TaskStatus>(existingTask?.status || 'backlog');
    const [priority, setPriority] = useState<Priority>(existingTask?.priority || 'medium');
    const [dueDate, setDueDate] = useState(existingTask?.dueDate?.split('T')[0] || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>(existingTask?.tags || []);

    // Subtask state
    const [subtaskTitle, setSubtaskTitle] = useState('');
    const [showSubtaskInput, setShowSubtaskInput] = useState(false);

    // Dependency state
    const [selectedDependency, setSelectedDependency] = useState('');

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'link'
    ];

    React.useEffect(() => {
        if (existingTask) {
            setTitle(existingTask.title);
            setDescription(existingTask.description || ''); // Ensure string
            setStatus(existingTask.status);
            setPriority(existingTask.priority);
            setDueDate(existingTask.dueDate?.split('T')[0] || '');
            setTags(existingTask.tags);
        } else {
            setTitle('');
            setDescription('');
            setStatus('backlog');
            setPriority('medium');
            setDueDate('');
            setTags([]);
        }
        setShowSubtaskInput(false);
        setSubtaskTitle('');
        setSelectedDependency('');
    }, [existingTask, isOpen]);

    const handleSave = () => {
        const taskData: Partial<Task> = {
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            tags,
        };

        if (taskId) {
            updateTask(taskId, taskData);
        } else {
            createTask(taskData);
        }

        onClose();
    };

    const handleDelete = () => {
        if (taskId) {
            deleteTask(taskId);
            onClose();
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleCreateSubtask = () => {
        if (taskId && subtaskTitle.trim()) {
            createSubtask(taskId, { title: subtaskTitle.trim() });
            setSubtaskTitle('');
            setShowSubtaskInput(false);
        }
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        if (taskId) {
            deleteSubtask(taskId, subtaskId);
        }
    };

    const handleAddDependency = () => {
        if (taskId && selectedDependency && selectedDependency !== taskId) {
            addDependency(taskId, selectedDependency);
            setSelectedDependency('');
        }
    };

    const handleRemoveDependency = (dependencyId: string) => {
        if (taskId) {
            removeDependency(taskId, dependencyId);
        }
    };

    const subtasks = taskId ? getSubtasks(taskId) : [];
    const dependencies = existingTask?.dependencyIds || [];
    const availableTasks = tasks.filter(t => t.id !== taskId && !t.parentId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taskId ? 'Редактировать задачу' : 'Новая задача'} size="lg">
            <div className="task-modal-form">
                <div className="form-group">
                    <label>Название</label>
                    <Input value={title} onChange={setTitle} placeholder="Введите название задачи" />
                </div>

                <div className="form-group">
                    <label>Описание</label>
                    <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Опишите задачу подробнее..."
                        className="description-editor"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Статус</label>
                        <select className="select" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Приоритет</label>
                        <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                            {PRIORITY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        <Calendar size={16} />
                        Срок выполнения
                    </label>
                    <Input type="date" value={dueDate} onChange={setDueDate} />
                </div>

                <div className="form-group">
                    <label>
                        <Tag size={16} />
                        Теги
                    </label>
                    <div className="tag-input-wrapper">
                        <Input value={tagInput} onChange={setTagInput} placeholder="Добавить тег" />
                        <Button onClick={handleAddTag} size="sm">
                            Добавить
                        </Button>
                    </div>
                    <div className="tags-list">
                        {tags.map((tag) => (
                            <Badge key={tag} variant="default">
                                {tag}
                                <button className="tag-remove" onClick={() => handleRemoveTag(tag)}>
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Subtasks Section */}
                {taskId && (
                    <div className="form-group">
                        <label>
                            <Plus size={16} />
                            Подзадачи
                        </label>
                        <div className="subtasks-list">
                            {subtasks.map((subtask) => (
                                <div key={subtask.id} className="subtask-item">
                                    <span className="subtask-title">{subtask.title}</span>
                                    <button
                                        className="icon-btn"
                                        onClick={() => handleDeleteSubtask(subtask.id)}
                                        title="Удалить подзадачу"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {showSubtaskInput ? (
                            <div className="subtask-input-wrapper">
                                <Input
                                    value={subtaskTitle}
                                    onChange={setSubtaskTitle}
                                    placeholder="Название подзадачи"
                                />
                                <Button onClick={handleCreateSubtask} size="sm">
                                    Создать
                                </Button>
                                <button
                                    className="icon-btn"
                                    onClick={() => {
                                        setShowSubtaskInput(false);
                                        setSubtaskTitle('');
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <Button
                                variant="secondary"
                                onClick={() => setShowSubtaskInput(true)}
                                size="sm"
                            >
                                <Plus size={14} />
                                Добавить подзадачу
                            </Button>
                        )}
                    </div>
                )}

                {/* Dependencies Section */}
                {taskId && (
                    <div className="form-group">
                        <label>
                            <Link2 size={16} />
                            Зависимости
                        </label>
                        <div className="dependencies-list">
                            {dependencies.map((depId) => {
                                const depTask = tasks.find(t => t.id === depId);
                                return depTask ? (
                                    <div key={depId} className="dependency-item">
                                        <span className="dependency-title">{depTask.title}</span>
                                        <button
                                            className="icon-btn"
                                            onClick={() => handleRemoveDependency(depId)}
                                            title="Удалить зависимость"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                        <div className="dependency-input-wrapper">
                            <select
                                className="select"
                                value={selectedDependency}
                                onChange={(e) => setSelectedDependency(e.target.value)}
                            >
                                <option value="">Выберите задачу...</option>
                                {availableTasks
                                    .filter(t => !dependencies.includes(t.id))
                                    .map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.title}
                                        </option>
                                    ))}
                            </select>
                            <Button
                                onClick={handleAddDependency}
                                size="sm"
                                disabled={!selectedDependency}
                            >
                                Добавить
                            </Button>
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    {taskId && (
                        <Button variant="ghost" onClick={handleDelete}>
                            <Trash2 size={16} />
                            Удалить
                        </Button>
                    )}
                    <div className="modal-actions-right">
                        <Button variant="secondary" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button onClick={handleSave}>Сохранить</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
