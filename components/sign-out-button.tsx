'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function SignOutButton({ className }: { className?: string }) {
    const router = useRouter();

    async function handleSignOut() {
        await authClient.signOut();
        router.push('/login');
        router.refresh();
    }

    return (
        <Button variant="outline" className={className} onClick={handleSignOut}>
            Logg ut
        </Button>
    );
}
