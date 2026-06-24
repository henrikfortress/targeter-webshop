'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { hasAdminRole, hasPrintShopRole } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';

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

export async function requirePrintShopSession() {
    const session = await requireSession();

    if (!hasPrintShopRole(session.user.role)) {
        throw new Error('Ikke autorisert');
    }

    const dbUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
        columns: { printShopId: true },
    });

    if (!dbUser?.printShopId) {
        throw new Error('Ikke autorisert');
    }

    return { session, printShopId: dbUser.printShopId };
}
