import React, { useState } from 'react';

interface MasterPasswordValidationProps {
  onSuccess: (masterPassword: string) => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function MasterPasswordValidation({
  onSuccess,
  onCancel,
  title = 'Ingresa tu Master Password',
  message = 'Se requiere tu master password para desencriptar y acceder a tus datos.',
}: MasterPasswordValidationProps) {
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!masterPassword) {
      setError('El master password es requerido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/validate-master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masterPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.isValid) {
        throw new Error(data.message || 'Master password incorrecto');
      }

      onSuccess(masterPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="modal-header">
        <h3>{title}</h3>
      </div>
      <p className="modal-message">
        {message}
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
              autoFocus
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
            {loading ? 'Validando...' : 'Validar'}
          </button>
        </div>
      </form>
    </div>
  );
}
