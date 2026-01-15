'use client';

import { useState } from 'react';
import { CopyButton } from './CopyButton';

export interface PasswordEntry {
    id: string;
    username: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

interface PasswordRowProps {
    entry: PasswordEntry | null;
    isNew?: boolean;
    onSave: (data: { username: string; password: string; description: string }) => Promise<void>;
    onUpdate: (id: string, data: { username?: string; password?: string; description?: string }) => Promise<void>;
    onDelete: (id: string, description: string) => void;
    onCancelNew?: () => void;
}

export function PasswordRow({
    entry,
    isNew = false,
    onSave,
    onUpdate,
    onDelete,
    onCancelNew,
}: PasswordRowProps) {
    const [isEditing, setIsEditing] = useState(isNew);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: entry?.username || '',
        password: '',
        description: entry?.description || '',
    });

    const handleSave = async () => {
        if (!formData.username || !formData.description) return;
        if (isNew && !formData.password) return;

        setLoading(true);
        try {
            if (isNew) {
                await onSave(formData);
                onCancelNew?.();
            } else if (entry) {
                await onUpdate(entry.id, {
                    username: formData.username !== entry.username ? formData.username : undefined,
                    password: formData.password || undefined,
                    description: formData.description !== entry.description ? formData.description : undefined,
                });
                setIsEditing(false);
                setFormData({ ...formData, password: '' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (isNew) {
            onCancelNew?.();
        } else {
            setIsEditing(false);
            setFormData({
                username: entry?.username || '',
                password: '',
                description: entry?.description || '',
            });
        }
    };

    const decryptPassword = async (): Promise<string> => {
        if (!entry) return '';
        const res = await fetch(`/api/passwords/${entry.id}/decrypt`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to decrypt');
        const data = await res.json();
        return data.password;
    };

    if (isEditing) {
        return (
            <tr className="password-row editing">
                <td>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Usuario"
                        className="input-field"
                        autoFocus
                    />
                </td>
                <td>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={isNew ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                        className="input-field"
                    />
                </td>
                <td>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción / Servicio"
                        className="input-field"
                    />
                </td>
                <td className="actions-cell">
                    <button onClick={handleSave} className="btn-save" disabled={loading}>
                        {loading ? <span className="spinner-small"></span> : 'Guardar'}
                    </button>
                    <button onClick={handleCancel} className="btn-cancel-small" disabled={loading}>
                        Cancelar
                    </button>
                </td>
            </tr>
        );
    }

    if (!entry) return null;

    return (
        <tr className="password-row">
            <td>
                <div className="cell-content">
                    <span className="username">{entry.username}</span>
                    <CopyButton value={entry.username} label="Usuario" variant="user" />
                </div>
            </td>
            <td>
                <div className="cell-content">
                    <span className="password-dots">••••••••</span>
                    <CopyButton value="" label="Contraseña" onDecrypt={decryptPassword} variant="password" />
                </div>
            </td>
            <td>
                <span className="description">{entry.description}</span>
            </td>
            <td className="actions-cell">
                <button onClick={() => setIsEditing(true)} className="btn-edit">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
                <button onClick={() => onDelete(entry.id, entry.description)} className="btn-delete-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            </td>
        </tr>
    );
}
