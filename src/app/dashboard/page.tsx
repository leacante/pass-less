import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from './DashboardShell';
import { loadDashboardData } from './actions';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/');
    }

    const { passwords, tags, workspaces } = await loadDashboardData();

    return (
        <DashboardShell
            user={session.user as { name?: string | null; email: string; image?: string | null }}
            initialPasswords={passwords}
            initialTags={tags}
            initialWorkspaces={workspaces}
        />
    );
}
