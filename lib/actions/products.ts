'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { orderItem, product, productSize } from '@/lib/db/schema';

export type ProductSizeInput = {
    id?: string;
    size: string;
    stock: number;
};

export type ProductInput = {
    name: string;
    description: string;
    active: boolean;
    sizes: ProductSizeInput[];
};

function revalidateProductPaths() {
    revalidatePath('/');
    revalidatePath('/admin/products');
}

export async function createProduct(input: ProductInput) {
    await requireAdminSession();

    if (!input.name.trim()) {
        return { error: 'Produktnavn er påkrevd' };
    }

    if (input.sizes.length === 0) {
        return { error: 'Legg til minst én størrelse' };
    }

    const productId = crypto.randomUUID();

    await db.insert(product).values({
        id: productId,
        name: input.name.trim(),
        description: input.description.trim() || null,
        active: input.active,
    });

    await db.insert(productSize).values(
        input.sizes.map((size) => ({
            id: crypto.randomUUID(),
            productId,
            size: size.size.trim(),
            stock: Math.max(0, size.stock),
        })),
    );

    revalidateProductPaths();
    return { success: true };
}

export async function updateProduct(productId: string, input: ProductInput) {
    await requireAdminSession();

    if (!input.name.trim()) {
        return { error: 'Produktnavn er påkrevd' };
    }

    if (input.sizes.length === 0) {
        return { error: 'Legg til minst én størrelse' };
    }

    await db
        .update(product)
        .set({
            name: input.name.trim(),
            description: input.description.trim() || null,
            active: input.active,
        })
        .where(eq(product.id, productId));

    const existingSizes = await db.query.productSize.findMany({
        where: eq(productSize.productId, productId),
    });

    const incomingIds = new Set(input.sizes.filter((size) => size.id).map((size) => size.id!));
    const sizesToDelete = existingSizes.filter((size) => !incomingIds.has(size.id));

    for (const size of sizesToDelete) {
        await db.delete(productSize).where(eq(productSize.id, size.id));
    }

    for (const size of input.sizes) {
        if (size.id) {
            await db
                .update(productSize)
                .set({
                    size: size.size.trim(),
                    stock: Math.max(0, size.stock),
                })
                .where(eq(productSize.id, size.id));
        } else {
            await db.insert(productSize).values({
                id: crypto.randomUUID(),
                productId,
                size: size.size.trim(),
                stock: Math.max(0, size.stock),
            });
        }
    }

    revalidateProductPaths();
    return { success: true };
}

export async function deleteProduct(productId: string) {
    await requireAdminSession();

    const referencedInOrder = await db.query.orderItem.findFirst({
        where: eq(orderItem.productId, productId),
        columns: { id: true },
    });

    if (referencedInOrder) {
        return {
            error: 'Produktet kan ikke slettes fordi det finnes i bestillinger. Deaktiver produktet i stedet.',
        };
    }

    await db.delete(product).where(eq(product.id, productId));

    revalidateProductPaths();
    return { success: true };
}
