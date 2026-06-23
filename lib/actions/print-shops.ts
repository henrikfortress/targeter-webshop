'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { printShop, productSize, productSizeStock } from '@/lib/db/schema';

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

    const printShopId = crypto.randomUUID();

    await db.insert(printShop).values({
        id: printShopId,
        name: input.name.trim(),
        email: input.email.trim(),
        active: input.active,
    });

    const sizes = await db.query.productSize.findMany({
        columns: { id: true },
    });

    if (sizes.length > 0) {
        await db.insert(productSizeStock).values(
            sizes.map((size) => ({
                id: crypto.randomUUID(),
                productSizeId: size.id,
                printShopId,
                stock: 0,
            })),
        );
    }

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
