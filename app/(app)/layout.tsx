import { headers } from 'next/headers';
import { AppShell } from '@/components/app-shell';
import { auth } from '@/lib/auth';
import { hasAdminRole } from '@/lib/auth-utils';
import { getActivePrintShops } from '@/lib/queries/print-shops';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    const isAdmin = hasAdminRole(user?.role);
    const printShops = await getActivePrintShops();

    return (
        <AppShell user={user} isAdmin={isAdmin} printShops={printShops}>
            {children}
        </AppShell>
    );
}
