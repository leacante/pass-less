'use client';

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { CopyButton } from './CopyButton';
import { PasswordDTO } from '@/core/application/dto/PasswordDTO';
import { Tag, Workspace } from '@/core/domain/models/password';

interface PasswordRowProps {
    entry: PasswordDTO | null;
    isNew?: boolean;
    availableTags: Tag[];
    availableWorkspaces: Workspace[];
    defaultWorkspaceId?: string;
    rowIndex?: number;
    onSave: (data: { username: string; password: string; description: string; observation?: string; tagId?: string; workspaceId?: string | null }) => Promise<void>;
    onUpdate: (
        id: string,
        data: { username?: string; password?: string; description?: string; observation?: string; tagId?: string | null; workspaceId?: string | null }
    ) => Promise<void>;
    onDelete: (id: string, description: string) => void;
    onCancelNew?: () => void;
    onDecrypt?: (id: string) => Promise<string>;
    onDragStart?: (id: string) => void;
    onDragEnd?: () => void;
}

export function PasswordRow({
    entry,
    isNew = false,
    availableTags,
    availableWorkspaces,
    defaultWorkspaceId,
    rowIndex = 0,
    onSave,
    onUpdate,
    onDelete,
    onCancelNew,
    onDecrypt,
    onDragStart,
    onDragEnd,
}: PasswordRowProps) {
    const [isEditing, setIsEditing] = useState(isNew);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: entry?.username || '',
        password: '',
        description: entry?.description || '',
        observation: entry?.observation || '',
        tagId: entry?.tagId || '',
        workspaceId: entry?.workspaceId || defaultWorkspaceId || '',
    });

    const generateSecurePassword = () => {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{};:,.<>?';
        const all = upper + lower + digits + symbols;
        const take = (source: string) => source[Math.floor(Math.random() * source.length)];

        const base = [take(upper), take(lower), take(digits), take(symbols)];
        const rest = Array.from({ length: 12 }, () => take(all));
        const mix = [...base, ...rest]
            .sort(() => Math.random() - 0.5)
            .join('');

        setFormData((prev) => ({ ...prev, password: mix }));
        setShowPassword(true);
    };

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
                    observation: formData.observation !== (entry.observation || '') ? formData.observation : undefined,
                    tagId: formData.tagId !== (entry.tagId || '') ? formData.tagId : undefined,
                    workspaceId:
                        formData.workspaceId !== (entry.workspaceId || '')
                            ? formData.workspaceId || null
                            : undefined,
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
                observation: entry?.observation || '',
                tagId: entry?.tagId || '',
                workspaceId: entry?.workspaceId || defaultWorkspaceId || '',
            });
        }
    };

    const decryptPassword = async (): Promise<string> => {
        if (!entry) return '';
        if (!onDecrypt) return '';
        return onDecrypt(entry.id);
    };

    if (isEditing) {
        return (
            <tr className="password-row editing">
                <td colSpan={4}>
                    <div className="editing-form">
                        <div className="form-grid">
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Usuario"
                                className="input-field field-username"
                                autoFocus
                            />
                            <div className="password-input-group field-password">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isNew ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                                    className="input-field"
                                />
                                <button
                                    type="button"
                                    className="btn-generate-password"
                                    onClick={generateSecurePassword}
                                    aria-label="Generar contraseña segura"
                                >
                                    Generar
                                </button>
                                <button
                                    type="button"
                                    className="btn-toggle-visibility"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 3l18 18" />
                                            <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
                                            <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-0.6 1.34-1.5 2.53-2.62 3.5" />
                                            <path d="M6.11 6.11C4.08 7.23 2.53 8.98 1 12c1.73 3.89 6 7 11 7 1.1 0 2.15-.15 3.12-.44" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descripción / Servicio"
                                className="input-field field-description"
                            />
                            <select
                                value={formData.tagId}
                                onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}
                                className="input-field field-tag"
                            >
                                <option value="">Sin Tag</option>
                                {availableTags.map((tag) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={formData.workspaceId}
                                onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
                                className="input-field field-workspace"
                            >
                                <option value="">Sin espacio</option>
                                {availableWorkspaces.map((workspace) => (
                                    <option key={workspace.id} value={workspace.id}>
                                        {workspace.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-grid form-grid--single">
                            <MDEditor
                                value={formData.observation}
                                onChange={(e) => setFormData({ ...formData, observation: e || '' })}
                                className="input-field textarea-field"
                                minHeight={200}
                                
                            />
                        </div>
                        <div className="form-actions">
                            <button onClick={handleSave} className="btn-save" disabled={loading}>
                                {loading ? <span className="spinner-small"></span> : 'Guardar'}
                            </button>
                            <button onClick={handleCancel} className="btn-cancel-small" disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }

    if (!entry) return null;

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(entry.id);
    };

    const handleDragEnd = () => {
        onDragEnd?.();
    };

    return (
        <>
            <tr 
                className={`password-row ${isExpanded ? 'expanded' : ''} draggable-row ${rowIndex % 2 === 0 ? 'row-even' : 'row-odd'}`}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <td>
                    <div className="cell-content">
                        <button
                            className={`btn-expand ${isExpanded ? 'active' : ''}`}
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points={isExpanded ? '6 15 12 9 18 15' : '6 9 12 15 18 9'} />
                            </svg>
                        </button>
                        <CopyButton value={entry.username} label={entry.username} variant="user" />
                    </div>
                </td>
                <td>
                    <div className="cell-content">
                        <span className="password-dots">••••••••</span>
                        <CopyButton value="" label="Contraseña" onDecrypt={decryptPassword} variant="password" />
                    </div>
                </td>
                <td>
                    <div className="cell-content">
                        <span className="description">{entry.description}</span>
                        {entry.tag && (
                            <span 
                                className="tag-badge"
                                style={{ 
                                    backgroundColor: entry.tag.color,
                                    color: '#1a1a1a',
                                    fontWeight: 700,
                                }}
                            >
                                {entry.tag.name}
                            </span>
                        )}
                    </div>
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
            {isExpanded && (
                <tr className="observation-row">
                    <td colSpan={4}>
                        <div className="observation-content">
                            <h4>Observaciones</h4>
                            {entry.observation ? (
                                <div className="markdown-body">
                                    <MDEditor.Markdown source={entry.observation} />
                                </div>
                            ) : (
                                <p className="no-observation">Sin observaciones.</p>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
