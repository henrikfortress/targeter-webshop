'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { hasAdminRole } from '@/lib/auth-utils';

export async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error('Ikke autorisert');
    }

    return session;
}

export async function requireAdminSession() {
    const session = await requireSession();

    if (!hasAdminRole(session.user.role)) {
        throw new Error('Ikke autorisert');
    }

    return session;
}
