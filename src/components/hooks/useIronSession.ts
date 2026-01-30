'use client';

import { useEffect, useState } from 'react';
import { SessionData } from '@/lib/iron-session';

export function useIronSession() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/session');
                if (response.ok) {
                    const data = await response.json();
                    setSession(data);
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    return { session, loading };
}
