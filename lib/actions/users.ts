'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { requireAdminSession } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { printShop, user } from '@/lib/db/schema';

export type CreateUserInput = {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin' | 'print_shop';
    printShopId?: string | null;
};

export async function createUser(input: CreateUserInput) {
    await requireAdminSession();

    if (input.role === 'print_shop' && !input.printShopId) {
        return { error: 'Velg trykkeri for trykkeri-brukeren' };
    }

    if (input.printShopId) {
        const shop = await db.query.printShop.findFirst({
            where: eq(printShop.id, input.printShopId),
        });

        if (!shop) {
            return { error: 'Trykkeriet ble ikke funnet' };
        }
    }

    const result = await auth.api.createUser({
        body: {
            email: input.email,
            password: input.password,
            name: input.name,
            ...(input.role === 'print_shop' ? {} : { role: input.role }),
        },
    });

    if (input.role === 'print_shop') {
        await db
            .update(user)
            .set({
                role: 'print_shop',
                printShopId: input.printShopId ?? null,
            })
            .where(eq(user.id, result.user.id));
    }

    revalidatePath('/admin/users');

    return { success: true, userId: result.user.id };
}

export async function updateUserRole(userId: string, role: 'user' | 'admin' | 'print_shop') {
    await requireAdminSession();

    await db.update(user).set({ role }).where(eq(user.id, userId));

    revalidatePath('/admin/users');

    return { success: true as const };
}

export async function getUserPrintShopId(userId: string) {
    await requireAdminSession();

    const dbUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { printShopId: true },
    });

    return dbUser?.printShopId ?? null;
}

export async function setUserPrintShop(userId: string, printShopId: string | null) {
    await requireAdminSession();

    if (printShopId) {
        const shop = await db.query.printShop.findFirst({
            where: eq(printShop.id, printShopId),
        });

        if (!shop) {
            return { error: 'Trykkeriet ble ikke funnet' };
        }
    }

    await db.update(user).set({ printShopId }).where(eq(user.id, userId));

    revalidatePath('/admin/users');

    return { success: true };
}
