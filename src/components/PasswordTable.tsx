'use client';

import { useState, useEffect, Fragment } from 'react';
import { PasswordRow, PasswordEntry } from './PasswordRow';
import { DeleteConfirmModal } from './DeleteConfirmModal';

import { TagManager } from './TagManager';

export function PasswordTable() {
    const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tags, setTags] = useState<import('./TagManager').Tag[]>([]);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('all');
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [workspaceError, setWorkspaceError] = useState<string | null>(null);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);
    const [deleteWorkspaceTarget, setDeleteWorkspaceTarget] = useState<{ id: string; name: string } | null>(null);

    const fetchPasswords = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/passwords');
            if (!res.ok) throw new Error('Failed to fetch passwords');
            const data = await res.json();
            setPasswords(data);
        } catch (err) {
            setError('Error al cargar las contraseñas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPasswords();
        fetchTags();
        fetchWorkspaces();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            if (res.ok) {
                const data = await res.json();
                setTags(data);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch('/api/workspaces');
            if (res.ok) {
                const data = await res.json();
                setWorkspaces(data);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        }
    };

    const handleCreateWorkspace = async () => {
        const name = newWorkspaceName.trim();
        if (!name || workspaceLoading) return;

        try {
            setWorkspaceLoading(true);
            setWorkspaceError(null);
            const res = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Error al crear el espacio' }));
                throw new Error(err.error || 'Error al crear el espacio');
            }
            const created = await res.json();
            const next = [...workspaces, created].sort((a, b) => a.name.localeCompare(b.name));
            setWorkspaces(next);
            setSelectedWorkspaceId(created.id);
            setNewWorkspaceName('');
        } catch (err) {
            setWorkspaceError(err instanceof Error ? err.message : 'Error al crear el espacio');
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const handleDeleteWorkspaceRequest = (id: string, name: string) => {
        setDeleteWorkspaceTarget({ id, name });
    };

    const handleDeleteWorkspaceConfirm = async () => {
        if (!deleteWorkspaceTarget) return;

        try {
            const res = await fetch(`/api/workspaces/${deleteWorkspaceTarget.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete workspace');
            
            setWorkspaces(workspaces.filter((w) => w.id !== deleteWorkspaceTarget.id));
            
            // Si el workspace eliminado estaba seleccionado, cambiar a 'all'
            if (selectedWorkspaceId === deleteWorkspaceTarget.id) {
                setSelectedWorkspaceId('all');
            }
            
            // Actualizar las contraseñas para reflejar el cambio
            await fetchPasswords();
            
            setDeleteWorkspaceTarget(null);
        } catch (err) {
            console.error('Error deleting workspace:', err);
            setDeleteWorkspaceTarget(null);
        }
    };

    const handleSave = async (data: { username: string; password: string; description: string; observation?: string; tagId?: string; workspaceId?: string | null }) => {
        const res = await fetch('/api/passwords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...data,
                tagId: data.tagId?.trim() ? data.tagId : undefined,
                workspaceId: data.workspaceId?.toString().trim() ? data.workspaceId : undefined,
            }),
        });
        if (!res.ok) throw new Error('Failed to create password');
        const newPassword = await res.json();
        setPasswords([newPassword, ...passwords]);
        setIsAddingNew(false);
    };

    const handleUpdate = async (
        id: string,
        data: { username?: string; password?: string; description?: string; observation?: string; tagId?: string | null; workspaceId?: string | null }
    ) => {
        const res = await fetch(`/api/passwords/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update password');
        const updated = await res.json();
        setPasswords(passwords.map((p) => (p.id === id ? updated : p)));
    };

    const handleDeleteRequest = (id: string, description: string) => {
        setDeleteTarget({ id, description });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        const res = await fetch(`/api/passwords/${deleteTarget.id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete password');
        setPasswords(passwords.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    // Filtrar contraseñas según el término de búsqueda
    const filteredPasswords = passwords.filter((password) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            password.username.toLowerCase().includes(search) ||
            password.description.toLowerCase().includes(search) ||
            (password.tag && password.tag.name.toLowerCase().includes(search));

        const matchesTags = selectedTagIds.length === 0 || (password.tagId && selectedTagIds.includes(password.tagId));

        const matchesWorkspace =
            selectedWorkspaceId === 'all'
                ? true
                : selectedWorkspaceId === 'none'
                    ? !password.workspaceId
                    : password.workspaceId === selectedWorkspaceId;

        return matchesSearch && matchesTags && matchesWorkspace;
    });

    const groupedPasswords = (() => {
        const groups = new Map<string, { id: string; name: string; items: PasswordEntry[] }>();

        for (const password of filteredPasswords) {
            const key = password.workspaceId || 'none';
            const name =
                password.workspace?.name ||
                workspaces.find((workspace) => workspace.id === password.workspaceId)?.name ||
                (key === 'none' ? 'Sin espacio' : 'Espacio');

            if (!groups.has(key)) {
                groups.set(key, { id: key, name, items: [] });
            }
            groups.get(key)?.items.push(password);
        }

        if (isAddingNew && selectedWorkspaceId !== 'all' && !groups.has(selectedWorkspaceId)) {
            const name =
                selectedWorkspaceId === 'none'
                    ? 'Sin espacio'
                    : workspaces.find((workspace) => workspace.id === selectedWorkspaceId)?.name || 'Espacio';
            groups.set(selectedWorkspaceId, { id: selectedWorkspaceId, name, items: [] });
        }

        const orderedKeys =
            selectedWorkspaceId === 'all'
                ? [...workspaces.map((workspace) => workspace.id), 'none']
                : [selectedWorkspaceId];

        return orderedKeys
            .filter((key) => groups.has(key))
                .map((key) => groups.get(key)!)
                .filter((group) => group.items.length > 0 || (isAddingNew && group.id === selectedWorkspaceId));
    })();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando contraseñas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={fetchPasswords} className="btn-retry">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="workspace-layout">
            <aside className="workspace-sidebar">
                <div className="workspace-sidebar-header">
                    <h3>Espacios de trabajo</h3>
                </div>
                <div className="workspace-create">
                    <input
                        type="text"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateWorkspace();
                            }
                        }}
                        placeholder="Nuevo espacio..."
                        className="input-field"
                    />
                    <button
                        className="btn-add-small"
                        onClick={handleCreateWorkspace}
                        disabled={workspaceLoading || !newWorkspaceName.trim()}
                    >
                        +
                    </button>
                </div>
                {workspaceError && <p className="workspace-error">{workspaceError}</p>}

                <ul className="workspace-list">
                    <li>
                        <button
                            className={`workspace-item ${selectedWorkspaceId === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedWorkspaceId('all')}
                        >
                            Todos
                        </button>
                    </li>
                    <li>
                        <button
                            className={`workspace-item ${selectedWorkspaceId === 'none' ? 'active' : ''}`}
                            onClick={() => setSelectedWorkspaceId('none')}
                        >
                            Sin espacio
                        </button>
                    </li>
                    {workspaces.map((workspace) => (
                        <li key={workspace.id}>
                            <div className="workspace-item-container">
                                <button
                                    className={`workspace-item ${selectedWorkspaceId === workspace.id ? 'active' : ''}`}
                                    onClick={() => setSelectedWorkspaceId(workspace.id)}
                                >
                                    {workspace.name}
                                </button>
                                <button
                                    className="workspace-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteWorkspaceRequest(workspace.id, workspace.name);
                                    }}
                                    title="Eliminar espacio"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>

            <div className="password-table-container">
                <div className="table-header">
                    <div>
                        <h2>Mis Contraseñas</h2>
                        {selectedWorkspaceId !== 'all' && (
                            <p className="workspace-selected">
                                {selectedWorkspaceId === 'none'
                                    ? 'Sin espacio'
                                    : workspaces.find((workspace) => workspace.id === selectedWorkspaceId)?.name || 'Espacio'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="btn-add"
                        disabled={isAddingNew}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nueva Contraseña
                    </button>
                </div>

                <div className="search-filter" style={{ flexWrap: 'wrap' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por usuario o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ minWidth: '200px' }}
                    />

                    <div className="tag-filter" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                        <div className="tag-select-container">
                            <select
                                className="input-field"
                                style={{ height: '36px', padding: '0 0.5rem' }}
                                onChange={(e) => {
                                    if (e.target.value && !selectedTagIds.includes(e.target.value)) {
                                        setSelectedTagIds([...selectedTagIds, e.target.value]);
                                        e.target.value = ''; // Reset select
                                    }
                                }}
                            >
                                <option value="">Filtrar por Tags...</option>
                                {tags.filter(t => !selectedTagIds.includes(t.id)).map(tag => (
                                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                                ))}
                            </select>
                        </div>

                        <button onClick={() => setIsTagManagerOpen(true)} className="btn-cancel-small" style={{ marginLeft: '1rem' }}>
                            Administrar Tags
                        </button>
                    </div>

                    {selectedTagIds.length > 0 && (
                        <div style={{ flexBasis: '100%', display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {selectedTagIds.map(id => {
                                const tag = tags.find(t => t.id === id);
                                return tag ? (
                                    <span key={id} className="tag-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {tag.name}
                                        <button
                                            onClick={() => setSelectedTagIds(selectedTagIds.filter(tid => tid !== id))}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', width: '16px', height: '16px', border: 'none', cursor: 'pointer', color: 'currentColor' }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ) : null;
                            })}
                            <button
                                onClick={() => setSelectedTagIds([])}
                                className="clear-search"
                                style={{ fontSize: '0.8rem' }}
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                <div className="table-wrapper">
                    <table className="password-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Contraseña</th>
                                <th>Descripción / Servicio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isAddingNew && selectedWorkspaceId === 'all' && (
                                <PasswordRow
                                    entry={null}
                                    isNew
                                    availableTags={tags}
                                    availableWorkspaces={workspaces}
                                    onSave={handleSave}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDeleteRequest}
                                    onCancelNew={() => setIsAddingNew(false)}
                                />
                            )}
                            {groupedPasswords.map((group) => (
                                <Fragment key={group.id}>
                                    <tr className="workspace-separator">
                                        <td colSpan={4}>{group.name}</td>
                                    </tr>
                                    {isAddingNew && selectedWorkspaceId === group.id && (
                                        <PasswordRow
                                            entry={null}
                                            isNew
                                            availableTags={tags}
                                            availableWorkspaces={workspaces}
                                            defaultWorkspaceId={group.id === 'none' ? '' : group.id}
                                            onSave={handleSave}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDeleteRequest}
                                            onCancelNew={() => setIsAddingNew(false)}
                                        />
                                    )}
                                    {group.items.map((password) => (
                                        <PasswordRow
                                            key={password.id}
                                            entry={password}
                                            availableTags={tags}
                                            availableWorkspaces={workspaces}
                                            onSave={handleSave}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDeleteRequest}
                                        />
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>

                    {passwords.length === 0 && !isAddingNew && (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <h3>No hay contraseñas guardadas</h3>
                            <p>Haz clic en &quot;Nueva Contraseña&quot; para agregar tu primera entrada.</p>
                        </div>
                    )}

                    {passwords.length > 0 && filteredPasswords.length === 0 && !isAddingNew && (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <h3>No se encontraron resultados</h3>
                            <p>No hay contraseñas que coincidan con &quot;{searchTerm}&quot;</p>
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                description={deleteTarget?.description || ''}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />

            <DeleteConfirmModal
                isOpen={!!deleteWorkspaceTarget}
                description={deleteWorkspaceTarget ? `el espacio de trabajo "${deleteWorkspaceTarget.name}"` : ''}
                onConfirm={handleDeleteWorkspaceConfirm}
                onCancel={() => setDeleteWorkspaceTarget(null)}
            />

            {isTagManagerOpen && (
                <TagManager
                    onClose={() => setIsTagManagerOpen(false)}
                    onTagsChange={fetchTags}
                />
            )}
        </div>
    );
}
