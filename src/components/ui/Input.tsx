import React from 'react';
import './Input.css';

interface InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'search' | 'date';
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    value,
    onChange,
    placeholder,
    type = 'text',
    disabled = false,
    className = '',
    icon,
}) => {
    return (
        <div className={`input-wrapper ${className}`}>
            {icon && <div className="input-icon">{icon}</div>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="input"
            />
        </div>
    );
};
