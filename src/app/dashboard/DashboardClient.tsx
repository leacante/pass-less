'use client';

import { PasswordTable } from '@/components/PasswordTable';
import { AuthButton } from '@/components/AuthButton';

interface DashboardClientProps {
    user: {
        name?: string | null;
        email: string;
        image?: string | null;
    };
}

export function DashboardClient({ user }: DashboardClientProps) {
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <svg viewBox="0 0 24 24" width="32" height="32" className="header-logo">
                        <defs>
                            <linearGradient id="lockGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="url(#lockGradientSmall)" />
                        <path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="url(#lockGradientSmall)" strokeWidth="2" />
                    </svg>
                    <h1>Pass-Less</h1>
                </div>
                <div className="header-right">
                    <AuthButton />
                </div>
            </header>
            <main className="dashboard-main">
                <PasswordTable />
            </main>
            <footer className="dashboard-footer">
                <p>
                    Encriptación AES-256-GCM • Almacenamiento seguro
                </p>
            </footer>
        </div>
    );
}
