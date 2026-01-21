'use client';

import { AuthButton } from '@/components/AuthButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PasswordTable } from '@/components/PasswordTable';
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
  const controller = usePasswordController({
    passwords: initialPasswords,
    tags: initialTags,
    workspaces: initialWorkspaces,
  });

  return (
    <div className="dashboard">
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
          <ThemeToggle />
          <AuthButton />
        </div>
      </header>
      <main className="dashboard-main">
        <PasswordTable
          passwords={controller.passwords}
          tags={controller.tags}
          workspaces={controller.workspaces}
          isBusy={controller.isPending}
          onCreatePassword={controller.createPassword}
          onUpdatePassword={controller.updatePassword}
          onDeletePassword={controller.deletePassword}
          onDecryptPassword={controller.decryptPassword}
          onCreateTag={controller.createTag}
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
