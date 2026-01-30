import React, { useState } from 'react';

interface MasterPasswordSetupProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MasterPasswordSetup({ onSuccess, onCancel }: MasterPasswordSetupProps) {
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!masterPassword) {
      setError('El master password es requerido');
      return;
    }

    if (masterPassword.length < 8) {
      setError('El master password debe tener al menos 8 caracteres');
      return;
    }

    if (masterPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masterPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al configurar el master password');
      }

      // Guardar en sesión
      const sessionResponse = await fetch('/api/session/master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ masterPassword }),
      });

      if (!sessionResponse.ok) {
        console.warn('Failed to save master password to session');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="modal-header">
        <h3>Configurar Master Password</h3>
      </div>
      <p className="modal-message">
        Tu master password es la clave maestra para encriptar todos tus datos.
      </p>
      <p className="modal-warning">
        Asegúrate de elegir una contraseña fuerte que puedas recordar.
      </p>

      <form onSubmit={handleSubmit} className="stack">
        {error && (
          <div className="block" style={{ borderColor: 'var(--accent-red)', background: 'var(--bg-yellow)' }}>
            {error}
          </div>
        )}

        <div className="stack">
          <label htmlFor="masterPassword">Master Password</label>
          <div className="password-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="masterPassword"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Ingresa tu master password"
              className="input-field"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-small btn-secondary"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <div className="stack">
          <label htmlFor="confirmPassword">Confirmar Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma tu master password"
            className="input-field"
            disabled={loading}
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Configurando...' : 'Configurar'}
          </button>
        </div>
      </form>
    </div>
  );
}
