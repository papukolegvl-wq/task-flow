import React from 'react';
import './Badge.css';
import { Priority, TaskStatus } from '../../types';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | TaskStatus | Priority;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
};
