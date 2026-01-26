'use client';

import { Fragment, useMemo, useState, useRef, useEffect } from 'react';
import { PasswordRow } from './PasswordRow';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { TagManager } from './TagManager';
import { PasswordDTO } from '@/core/application/dto/PasswordDTO';
import { Tag, Workspace } from '@/core/domain/models/password';

interface PasswordTableProps {
    passwords: PasswordDTO[];
    tags: Tag[];
    workspaces: Workspace[];
    isBusy?: boolean;
    onCreatePassword: (data: { username: string; password: string; description: string; observation?: string; tagId?: string; workspaceId?: string | null }) => Promise<void>;
    onUpdatePassword: (
        id: string,
        data: { username?: string; password?: string; description?: string; observation?: string; tagId?: string | null; workspaceId?: string | null }
    ) => Promise<void>;
    onDeletePassword: (id: string) => Promise<void>;
    onDecryptPassword: (id: string) => Promise<string>;
    onCreateTag: (name: string) => Promise<Tag>;
    onCreateWorkspace: (name: string) => Promise<Workspace>;
    onDeleteWorkspace: (id: string) => Promise<void>;
}

export function PasswordTable({
    passwords,
    tags,
    workspaces,
    isBusy,
    onCreatePassword,
    onUpdatePassword,
    onDeletePassword,
    onDecryptPassword,
    onCreateTag,
    onCreateWorkspace,
    onDeleteWorkspace,
}: PasswordTableProps) {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('all');
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [deleteWorkspaceTarget, setDeleteWorkspaceTarget] = useState<{ id: string; name: string } | null>(null);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [workspaceError, setWorkspaceError] = useState<string | null>(null);
    const [draggedPasswordId, setDraggedPasswordId] = useState<string | null>(null);
    const [dragOverWorkspaceId, setDragOverWorkspaceId] = useState<string | null>(null);
    const [collapsedWorkspaces, setCollapsedWorkspaces] = useState<Set<string>>(new Set());
    const autoScrollIntervalRef = useRef<number | null>(null);

    const filteredPasswords = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return passwords.filter((password) => {
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
    }, [passwords, searchTerm, selectedTagIds, selectedWorkspaceId]);

    const groupedPasswords = useMemo(() => {
        const groups = new Map<string, { id: string; name: string; items: PasswordDTO[] }>();

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
    }, [filteredPasswords, workspaces, isAddingNew, selectedWorkspaceId]);

    const handleSave = async (data: { username: string; password: string; description: string; observation?: string; tagId?: string; workspaceId?: string | null }) => {
        const tagId = data.tagId?.trim() ? data.tagId : undefined;
        const workspaceId = data.workspaceId?.trim() ? data.workspaceId : null;
        await onCreatePassword({ ...data, tagId, workspaceId });
        setIsAddingNew(false);
    };

    const handleUpdate = async (
        id: string,
        data: { username?: string; password?: string; description?: string; observation?: string; tagId?: string | null; workspaceId?: string | null },
    ) => {
        const tagId = data.tagId === undefined ? undefined : data.tagId?.trim() ? data.tagId : null;
        const workspaceId = data.workspaceId === undefined ? undefined : typeof data.workspaceId === 'string' ? (data.workspaceId.trim() ? data.workspaceId : null) : data.workspaceId;
        console.log('handleUpdate called with:', { id, data, workspaceId });
        await onUpdatePassword(id, { ...data, tagId, workspaceId });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        await onDeletePassword(deleteTarget.id);
        setDeleteTarget(null);
    };

    const handleCreateWorkspace = async () => {
        const name = newWorkspaceName.trim();
        if (!name) return;
        try {
            const created = await onCreateWorkspace(name);
            setNewWorkspaceName('');
            setSelectedWorkspaceId(created.id);
            setWorkspaceError(null);
        } catch (error) {
            setWorkspaceError(error instanceof Error ? error.message : 'No se pudo crear el espacio');
        }
    };

    const handleDeleteWorkspaceConfirm = async () => {
        if (!deleteWorkspaceTarget) return;
        await onDeleteWorkspace(deleteWorkspaceTarget.id);
        if (selectedWorkspaceId === deleteWorkspaceTarget.id) {
            setSelectedWorkspaceId('all');
        }
        setDeleteWorkspaceTarget(null);
    };

    const handleDragStart = (passwordId: string) => {
        setDraggedPasswordId(passwordId);
    };

    const handleDragEnd = () => {
        setDraggedPasswordId(null);
        setDragOverWorkspaceId(null);
        // Limpiar el intervalo de auto-scroll
        if (autoScrollIntervalRef.current) {
            window.clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    };

    // Efecto para manejar el auto-scroll durante el drag
    useEffect(() => {
        if (!draggedPasswordId) return;

        const handleMouseMove = (e: MouseEvent) => {
            const scrollThreshold = 150; // píxeles desde el borde de la ventana
            const scrollSpeed = 15; // píxeles por frame

            const mouseY = e.clientY;
            const windowHeight = window.innerHeight;
            const distanceFromTop = mouseY;
            const distanceFromBottom = windowHeight - mouseY;

            // Limpiar intervalo previo
            if (autoScrollIntervalRef.current) {
                window.clearInterval(autoScrollIntervalRef.current);
                autoScrollIntervalRef.current = null;
            }

            // Scroll hacia arriba cuando el cursor está cerca del borde superior
            if (distanceFromTop < scrollThreshold && distanceFromTop > 0) {
                autoScrollIntervalRef.current = window.setInterval(() => {
                    window.scrollBy(0, -scrollSpeed);
                }, 16); // ~60fps
            }
            // Scroll hacia abajo cuando el cursor está cerca del borde inferior
            else if (distanceFromBottom < scrollThreshold && distanceFromBottom > 0) {
                autoScrollIntervalRef.current = window.setInterval(() => {
                    window.scrollBy(0, scrollSpeed);
                }, 16); // ~60fps
            }
        };

        document.addEventListener('dragover', handleMouseMove);

        return () => {
            document.removeEventListener('dragover', handleMouseMove);
            if (autoScrollIntervalRef.current) {
                window.clearInterval(autoScrollIntervalRef.current);
                autoScrollIntervalRef.current = null;
            }
        };
    }, [draggedPasswordId]);

    const toggleWorkspaceCollapse = (workspaceId: string | null) => {
        const key = workspaceId || 'none';
        setCollapsedWorkspaces((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (workspaceId: string | null, e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverWorkspaceId(null);
        
        const passwordId = draggedPasswordId;
        console.log('Drop event - passwordId:', passwordId, 'workspaceId:', workspaceId);
        if (!passwordId) {
            console.log('No passwordId found');
            return;
        }

        // Find the password being dragged
        const password = passwords.find((p) => p.id === passwordId);
        if (!password) {
            console.log('Password not found');
            return;
        }

        console.log('Current workspace:', password.workspaceId, 'Target workspace:', workspaceId);

        // Don't update if it's already in the target workspace
        if (password.workspaceId === workspaceId) {
            console.log('Password already in target workspace');
            setDraggedPasswordId(null);
            return;
        }

        // Update the password with the new workspace
        console.log('Updating password to workspace:', workspaceId);
        await handleUpdate(passwordId, {
            workspaceId: workspaceId,
        });

        setDraggedPasswordId(null);
    };

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
                        disabled={isBusy}
                    />
                    <button
                        className="btn-add-small"
                        onClick={handleCreateWorkspace}
                        disabled={isBusy || !newWorkspaceName.trim()}
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
                                        setDeleteWorkspaceTarget({ id: workspace.id, name: workspace.name });
                                    }}
                                    title="Eliminar espacio"
                                    disabled={isBusy}
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
                        disabled={isAddingNew || isBusy}
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
                                        e.target.value = '';
                                    }
                                }}
                            >
                                <option value="">Filtrar por Tags...</option>
                                {tags.filter((t) => !selectedTagIds.includes(t.id)).map((tag) => (
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
                            {selectedTagIds.map((id) => {
                                const tag = tags.find((t) => t.id === id);
                                return tag ? (
                                    <span key={id} className="tag-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {tag.name}
                                        <button
                                            onClick={() => setSelectedTagIds(selectedTagIds.filter((tid) => tid !== id))}
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
                                    onDelete={(id, description) => setDeleteTarget({ id, description })}
                                    onCancelNew={() => setIsAddingNew(false)}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                />
                            )}
                            {groupedPasswords.map((group) => {
                                const isCollapsed = collapsedWorkspaces.has(group.id);
                                return (
                                    <Fragment key={group.id}>
                                        <tr 
                                            className={`workspace-separator ${dragOverWorkspaceId === group.id ? 'drag-over' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragEnter={() => setDragOverWorkspaceId(group.id)}
                                            onDragLeave={() => draggedPasswordId && setDragOverWorkspaceId(null)}
                                            onDrop={(e) => handleDrop(group.id === 'none' ? null : group.id, e)}
                                        >
                                            <td colSpan={4}>
                                                <div className="workspace-separator-header">
                                                    <button 
                                                        className={`workspace-collapse-btn ${isCollapsed ? 'collapsed' : ''}`}
                                                        onClick={() => toggleWorkspaceCollapse(group.id === 'none' ? null : group.id)}
                                                        title={isCollapsed ? 'Expandir' : 'Contraer'}
                                                    >
                                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points={isCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
                                                        </svg>
                                                    </button>
                                                    <span>{group.name}</span>
                                                </div>
                                            </td>
                                        </tr>
                                        {!isCollapsed && (
                                            <>
                                                {isAddingNew && selectedWorkspaceId === group.id && (
                                                    <PasswordRow
                                                        entry={null}
                                                        isNew
                                                        availableTags={tags}
                                                        availableWorkspaces={workspaces}
                                                        defaultWorkspaceId={group.id === 'none' ? '' : group.id}
                                                        onSave={handleSave}
                                                        onUpdate={handleUpdate}
                                                        onDelete={(id, description) => setDeleteTarget({ id, description })}
                                                        onCancelNew={() => setIsAddingNew(false)}
                                                        onDragStart={handleDragStart}
                                                        onDragEnd={handleDragEnd}
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
                                                        onDelete={(id, description) => setDeleteTarget({ id, description })}
                                                        onDecrypt={onDecryptPassword}
                                                        onDragStart={handleDragStart}
                                                        onDragEnd={handleDragEnd}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                    {passwords.length === 0 && !isAddingNew && (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <h3>No hay contraseñas guardadas</h3>
                            <p>Haz clic en "Nueva Contraseña" para agregar tu primera entrada.</p>
                        </div>
                    )}

                    {passwords.length > 0 && filteredPasswords.length === 0 && !isAddingNew && (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <h3>No se encontraron resultados</h3>
                            <p>No hay contraseñas que coincidan con "{searchTerm}"</p>
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
                    tags={tags}
                    onClose={() => setIsTagManagerOpen(false)}
                    onCreateTag={onCreateTag}
                    isBusy={isBusy}
                />
            )}
        </div>
    );
}
