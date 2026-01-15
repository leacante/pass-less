'use client';

import { useState, useEffect } from 'react';
import { PasswordRow, PasswordEntry } from './PasswordRow';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function PasswordTable() {
    const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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
    }, []);

    const handleSave = async (data: { username: string; password: string; description: string }) => {
        const res = await fetch('/api/passwords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create password');
        const newPassword = await res.json();
        setPasswords([newPassword, ...passwords]);
        setIsAddingNew(false);
    };

    const handleUpdate = async (
        id: string,
        data: { username?: string; password?: string; description?: string }
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
        return (
            password.username.toLowerCase().includes(search) ||
            password.description.toLowerCase().includes(search)
        );
    });

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
        <div className="password-table-container">
            <div className="table-header">
                <h2>Mis Contraseñas</h2>
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

            <div className="search-filter">
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
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="clear-search"
                        title="Limpiar búsqueda"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
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
                        {isAddingNew && (
                            <PasswordRow
                                entry={null}
                                isNew
                                onSave={handleSave}
                                onUpdate={handleUpdate}
                                onDelete={handleDeleteRequest}
                                onCancelNew={() => setIsAddingNew(false)}
                            />
                        )}
                        {filteredPasswords.map((password) => (
                            <PasswordRow
                                key={password.id}
                                entry={password}
                                onSave={handleSave}
                                onUpdate={handleUpdate}
                                onDelete={handleDeleteRequest}
                            />
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

            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                description={deleteTarget?.description || ''}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
