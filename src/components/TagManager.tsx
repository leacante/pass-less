
'use client';

import { useState } from 'react';
import { Tag } from '@/core/domain/models/password';

interface TagManagerProps {
    tags: Tag[];
    onClose: () => void;
    onCreateTag: (name: string) => Promise<Tag>;
    isBusy?: boolean;
}

export function TagManager({ tags, onClose, onCreateTag, isBusy }: TagManagerProps) {
    const [newTagName, setNewTagName] = useState('');

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;
        await onCreateTag(newTagName.trim());
        setNewTagName('');
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
                                <span 
                                    key={tag.id} 
                                    className="tag-badge" 
                                    style={{ 
                                        backgroundColor: tag.color,
                                        fontSize: '0.9rem', 
                                        padding: '0.25rem 0.75rem',
                                        color: '#1a1a1a',
                                        fontWeight: 700,
                                    }}
                                >
                                    {tag.name}
                                </span>
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
