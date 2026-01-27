
'use client';

import { useState } from 'react';
import { Tag } from '@/core/domain/models/password';

interface TagManagerProps {
    tags: Tag[];
    onClose: () => void;
    onCreateTag: (name: string) => Promise<Tag>;
    onDeleteTag?: (tagId: string) => Promise<void>;
    isBusy?: boolean;
}

export function TagManager({ tags, onClose, onCreateTag, onDeleteTag, isBusy }: TagManagerProps) {
    const [newTagName, setNewTagName] = useState('');
    const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;
        await onCreateTag(newTagName.trim());
        setNewTagName('');
    };

    const handleDeleteTag = async (tagId: string) => {
        if (!onDeleteTag) return;
        setDeletingTagId(tagId);
        try {
            await onDeleteTag(tagId);
        } finally {
            setDeletingTagId(null);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Administrar Tags</h3>
                </div>

                <form onSubmit={handleCreateTag} className="add-tag-form" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Nuevo Tag..."
                        className="input-field"
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-add" disabled={isBusy || !newTagName.trim()}>
                        Agregar
                    </button>
                </form>

                <div className="tags-list" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                    {tags.length === 0 ? (
                        <p className="empty-text" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay tags creados.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {tags.map(tag => (
                                <div
                                    key={tag.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        backgroundColor: tag.color,
                                        fontSize: '0.9rem',
                                        padding: '0.25rem 0.5rem',
                                        color: '#1a1a1a',
                                        fontWeight: 700,
                                        borderRadius: '0.25rem',
                                    }}
                                >
                                    <span>{tag.name}</span>
                                    {onDeleteTag && (
                                        <button
                                            onClick={() => handleDeleteTag(tag.id)}
                                            disabled={deletingTagId === tag.id || isBusy}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'inherit',
                                                cursor: deletingTagId === tag.id || isBusy ? 'not-allowed' : 'pointer',
                                                padding: '0',
                                                marginLeft: '0.25rem',
                                                fontSize: '1.1rem',
                                                lineHeight: '1',
                                                opacity: deletingTagId === tag.id || isBusy ? 0.5 : 1,
                                            }}
                                            title="Eliminar tag"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
