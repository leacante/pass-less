'use client';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({
    isOpen,
    description,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <svg viewBox="0 0 24 24" width="48" height="48" className="warning-icon">
                        <path
                            fill="currentColor"
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                        />
                    </svg>
                    <h3>Confirmar eliminación</h3>
                </div>
                <p className="modal-message">
                    ¿Estás seguro de que deseas eliminar la contraseña de{' '}
                    <strong>{description}</strong>?
                </p>
                <p className="modal-warning">Esta acción no se puede deshacer.</p>
                <div className="modal-actions">
                    <button onClick={onCancel} className="btn-cancel">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="btn-delete">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
