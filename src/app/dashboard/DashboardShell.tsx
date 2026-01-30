'use client';

import { useEffect, useState } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PasswordTable } from '@/components/PasswordTable';
import MasterPasswordSetup from '@/components/MasterPasswordSetup';
import MasterPasswordValidation from '@/components/MasterPasswordValidation';
import { usePasswordController } from '@/core/application/hooks/usePasswordController';
import { PasswordDTO } from '@/core/application/dto/PasswordDTO';
import { Tag, Workspace } from '@/core/domain/models/password';

interface DashboardShellProps {
  user: { name?: string | null; email: string; image?: string | null };
  initialPasswords: PasswordDTO[];
  initialTags: Tag[];
  initialWorkspaces: Workspace[];
}

export function DashboardShell({ user, initialPasswords, initialTags, initialWorkspaces }: DashboardShellProps) {
  const [hasMasterPassword, setHasMasterPassword] = useState(false);
  const [showMasterPasswordSetup, setShowMasterPasswordSetup] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ migrated: number; skipped: number; failed: number } | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const controller = usePasswordController({
    passwords: initialPasswords,
    tags: initialTags,
    workspaces: initialWorkspaces,
  });

  // Verificar si el usuario tiene master password configurado
  useEffect(() => {
    const checkMasterPasswordStatus = async () => {
      try {
        const response = await fetch('/api/users/profile');
        const data = await response.json();
        setHasMasterPassword(data.hasMasterPassword);
        
        // Mostrar setup si no tiene master password y no se ha rechazado antes
        if (!data.hasMasterPassword && !sessionStorage.getItem('masterPasswordSetupDismissed')) {
          setShowMasterPasswordSetup(true);
        }
      } catch (error) {
        console.error('Error checking master password status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMasterPasswordStatus();
  }, []);

  const handleMasterPasswordSetupSuccess = () => {
    setShowMasterPasswordSetup(false);
    setHasMasterPassword(true);
  };

  const handleMasterPasswordSetupCancel = () => {
    setShowMasterPasswordSetup(false);
    sessionStorage.setItem('masterPasswordSetupDismissed', 'true');
  };

  const handleMigrationStart = () => {
    setMigrationError(null);
    setShowMigrationModal(true);
  };

  const handleMigrationCancel = () => {
    setShowMigrationModal(false);
  };

  const handleMigrationConfirm = async (masterPassword: string) => {
    try {
      const result = await controller.migratePasswords(masterPassword);
      setMigrationResult(result);
      setShowMigrationModal(false);
    } catch (error) {
      setMigrationError(error instanceof Error ? error.message : 'No se pudo migrar');
    }
  };

  return (
    <div className="dashboard">
      {showMasterPasswordSetup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <MasterPasswordSetup
              onSuccess={handleMasterPasswordSetupSuccess}
              onCancel={handleMasterPasswordSetupCancel}
            />
          </div>
        </div>
      )}
      {showMigrationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <MasterPasswordValidation
              onSuccess={handleMigrationConfirm}
              onCancel={handleMigrationCancel}
            />
          </div>
        </div>
      )}
      <header className="dashboard-header">
        <div className="header-left">
          <svg viewBox="0 0 24 24" width="32" height="32" className="header-logo">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#4ade80" stroke="currentColor" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div>
            <h1>Pass-Less</h1>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
        <div className="header-right">
          {!loading && !hasMasterPassword && (
            <button
              onClick={() => setShowMasterPasswordSetup(true)}
              title="Configurar Master Password"
              className="btn btn-secondary"
            >
              🔑 Configurar Master Password
            </button>
          )}
          {!loading && hasMasterPassword && (
            <button
              onClick={handleMigrationStart}
              title="Migrar passwords al master password"
              className="btn btn-primary"
            >
              ♻️ Migrar passwords
            </button>
          )}
          <ThemeToggle />
          <AuthButton />
        </div>
      </header>
      {hasMasterPassword && migrationResult && (
        <div className="block" style={{ margin: '16px 0' }}>
          Migración completada: {migrationResult.migrated} migradas, {migrationResult.skipped} ya migradas, {migrationResult.failed} fallidas.
        </div>
      )}
      {hasMasterPassword && migrationError && (
        <div className="block" style={{ margin: '16px 0', borderColor: 'var(--accent-red)', background: 'var(--bg-yellow)' }}>
          {migrationError}
        </div>
      )}
      <main className="dashboard-main">
        <PasswordTable
          passwords={controller.passwords}
          tags={controller.tags}
          workspaces={controller.workspaces}
          isBusy={controller.isPending}
          hasMasterPassword={hasMasterPassword}
          onCreatePassword={controller.createPassword}
          onUpdatePassword={controller.updatePassword}
          onDeletePassword={controller.deletePassword}
          onDecryptPassword={controller.decryptPassword}
          onCreateTag={controller.createTag}
          onDeleteTag={controller.deleteTag}
          onCreateWorkspace={controller.createWorkspace}
          onDeleteWorkspace={controller.deleteWorkspace}
        />
      </main>
      <footer className="dashboard-footer">
        <p>🔒 Encriptación AES-256-GCM • Almacenamiento seguro</p>
      </footer>
    </div>
  );
}
