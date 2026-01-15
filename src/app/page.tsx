'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthButton } from '@/components/AuthButton';

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
      <div className="hero">
        <div className="logo-container">
          <svg viewBox="0 0 24 24" width="80" height="80" className="logo-icon">
            <defs>
              <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="url(#lockGradient)" />
            <path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="url(#lockGradient)" strokeWidth="2" />
            <circle cx="12" cy="16" r="1.5" fill="white" />
            <path d="M12 17.5v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="title">
          Pass<span className="highlight">-Less</span>
        </h1>
        <p className="subtitle">
          Gestiona tus contraseñas de forma segura con encriptación AES-256
        </p>
        <div className="features">
          <div className="feature">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Encriptación de grado militar</span>
          </div>
          <div className="feature">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <span>Login seguro con Google</span>
          </div>
          <div className="feature">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Acceso desde cualquier lugar</span>
          </div>
        </div>
        <AuthButton />
      </div>
      <div className="background-effects">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </main>
  );
}
