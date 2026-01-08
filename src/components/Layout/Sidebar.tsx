import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Input, Button } from '../ui';
import { Search, Plus, List, ChevronLeft, Menu } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    onCreateTask: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCreateTask, isOpen, onToggle }) => {
    const { viewMode, setViewMode, searchQuery, setSearchQuery } = useTaskStore();

    return (
        <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
            <button className="sidebar-toggle-btn" onClick={onToggle} title={isOpen ? "Свернуть" : "Развернуть"}>
                {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <>
                    <div className="sidebar-header">
                        <h1 className="sidebar-title">TaskFlow</h1>
                        <p className="sidebar-subtitle">Управление задачами</p>
                    </div>

                    <Button onClick={onCreateTask} className="create-task-btn">
                        <Plus size={18} />
                        Новая задача
                    </Button>

                    <div className="sidebar-search">
                        <Input
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Поиск задач..."
                            type="search"
                            icon={<Search size={16} />}
                        />
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-section-title">Вид</h3>
                        <div className="view-mode-buttons">
                            <button
                                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                                Список
                            </button>
                            {/* Board view removed as per request */}
                        </div>
                    </div>

                    {/* Stats removed as per request */}
                </>
            )}
        </div>
    );
};
