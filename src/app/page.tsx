'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <main className="landing">
        <div className="loading-spinner-large"></div>
      </main>
    );
  }

  return (
    <main className="landing">
      <div className="theme-toggle-landing">
        <ThemeToggle />
      </div>
      <div className="hero">
        <div className="logo-container">
          <svg viewBox="0 0 100 100" width="100" height="100" className="logo-icon">
            <rect x="15" y="45" width="70" height="45" rx="6" ry="6" fill="#4ade80" stroke="currentColor" strokeWidth="3" />
            <path d="M30 45V30a20 20 0 0140 0v15" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="65" r="6" fill="currentColor" />
            <rect x="47" y="70" width="6" height="12" fill="currentColor" />
          </svg>
        </div>
        <h1 className="title">
          Pass-Less
        </h1>
        <p className="subtitle">
          Gestiona tus contraseñas de forma segura con encriptación AES-256. 
          Simple, funcional y con personalidad.
        </p>
        <div className="features">
          <div className="feature">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Encriptación militar</span>
          </div>
          <div className="feature">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <span>Login con Google</span>
          </div>
          <div className="feature">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Acceso universal</span>
          </div>
        </div>
        <AuthButton />
      </div>
    </main>
  );
}
