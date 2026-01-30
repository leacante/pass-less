import 'next-auth';
import { SessionData } from '@/lib/iron-session';

declare module 'next-auth' {
    interface Session extends SessionData {
        user?: {
            id?: string;
            email?: string;
            name?: string;
            image?: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
    }
}

export type { SessionData };
