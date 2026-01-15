'use client';

import { useState, useEffect } from 'react';

export interface Tag {
    id: string;
    name: string;
    color?: string | null;
}

interface TagManagerProps {
    onClose: () => void;
    onTagsChange: () => void; // To refresh tags in parent
}

export function TagManager({ onClose, onTagsChange }: TagManagerProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        const res = await fetch('/api/tags');
        if (res.ok) {
            const data = await res.json();
            setTags(data);
        }
    };

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTagName }),
            });

            if (res.ok) {
                setNewTagName('');
                fetchTags();
                onTagsChange();
            }
        } finally {
            setLoading(false);
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
                    <button type="submit" className="btn-add" disabled={loading || !newTagName.trim()}>
                        Agregar
                    </button>
                </form>

                <div className="tags-list" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                    {tags.length === 0 ? (
                        <p className="empty-text" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay tags creados.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {tags.map(tag => (
                                <span key={tag.id} className="tag-badge" style={{ fontSize: '0.9rem', padding: '0.25rem 0.75rem' }}>
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
