import { headers } from 'next/headers';
import { AppShell } from '@/components/app-shell';
import { auth } from '@/lib/auth';
import { hasAdminRole } from '@/lib/auth-utils';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    const isAdmin = hasAdminRole(user?.role);

    return (
        <AppShell user={user} isAdmin={isAdmin}>
            {children}
        </AppShell>
    );
}
