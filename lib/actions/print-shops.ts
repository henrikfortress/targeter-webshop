'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { printShop } from '@/lib/db/schema';

export type PrintShopInput = {
    name: string;
    email: string;
    active: boolean;
};

function validatePrintShopInput(input: PrintShopInput) {
    if (!input.name.trim()) {
        return 'Navn er påkrevd';
    }

    const email = input.email.trim();
    if (!email) {
        return 'E-post er påkrevd';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Ugyldig e-postadresse';
    }

    return null;
}

function revalidatePrintShopPaths() {
    revalidatePath('/');
    revalidatePath('/admin/fulfillment');
}

export async function createPrintShop(input: PrintShopInput) {
    await requireAdminSession();

    const validationError = validatePrintShopInput(input);
    if (validationError) {
        return { error: validationError };
    }

    await db.insert(printShop).values({
        id: crypto.randomUUID(),
        name: input.name.trim(),
        email: input.email.trim(),
        active: input.active,
    });

    revalidatePrintShopPaths();
    return { success: true };
}

export async function updatePrintShop(printShopId: string, input: PrintShopInput) {
    await requireAdminSession();

    const validationError = validatePrintShopInput(input);
    if (validationError) {
        return { error: validationError };
    }

    await db
        .update(printShop)
        .set({
            name: input.name.trim(),
            email: input.email.trim(),
            active: input.active,
        })
        .where(eq(printShop.id, printShopId));

    revalidatePrintShopPaths();
    return { success: true };
}

export async function deletePrintShop(printShopId: string) {
    await requireAdminSession();

    await db.delete(printShop).where(eq(printShop.id, printShopId));

    revalidatePrintShopPaths();
    return { success: true };
}
