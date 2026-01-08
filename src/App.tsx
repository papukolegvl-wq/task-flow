import React, { useState } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { Sidebar } from './components/Layout';
import { TaskList } from './components/List';
import { KanbanBoard } from './components/Board';
import { TaskModal } from './components/TaskModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
    const { viewMode, selectedTaskId, setSelectedTask } = useTaskStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    const handleCreateTask = () => {
        setEditingTaskId(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (taskId: string) => {
        setEditingTaskId(taskId);
        setIsModalOpen(true);
    };

    React.useEffect(() => {
        if (selectedTaskId) {
            handleEditTask(selectedTaskId);
            setSelectedTask(null);
        }
    }, [selectedTaskId]);

    return (
        <div className={`app-layout ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                onCreateTask={handleCreateTask}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <main className="main-content">
                <div className="content-header">
                    <h2 className="content-title">
                        {viewMode === 'list' && 'Все задачи'}
                        {viewMode === 'board' && 'Канбан-доска'}
                    </h2>
                </div>

                <ErrorBoundary key={viewMode}>
                    {viewMode === 'list' && <TaskList key="list-view" />}
                    {viewMode === 'board' && <KanbanBoard key="board-view" />}
                </ErrorBoundary>
            </main>

            <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskId={editingTaskId} />
        </div>
    );
}

export default App;
