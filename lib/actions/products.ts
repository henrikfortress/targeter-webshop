'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { orderItem, product, productSize, productSizeStock } from '@/lib/db/schema';

export type ProductSizeStockInput = {
    printShopId: string;
    stock: number;
};

export type ProductSizeInput = {
    id?: string;
    size: string;
    stocks: ProductSizeStockInput[];
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

async function upsertSizeStocks(productSizeId: string, stocks: ProductSizeStockInput[]) {
    const existingStocks = await db.query.productSizeStock.findMany({
        where: eq(productSizeStock.productSizeId, productSizeId),
    });

    const incomingShopIds = new Set(stocks.map((entry) => entry.printShopId));

    for (const entry of existingStocks) {
        if (!incomingShopIds.has(entry.printShopId)) {
            await db.delete(productSizeStock).where(eq(productSizeStock.id, entry.id));
        }
    }

    for (const entry of stocks) {
        const existing = existingStocks.find((stock) => stock.printShopId === entry.printShopId);

        if (existing) {
            await db
                .update(productSizeStock)
                .set({ stock: Math.max(0, entry.stock) })
                .where(eq(productSizeStock.id, existing.id));
        } else {
            await db.insert(productSizeStock).values({
                id: crypto.randomUUID(),
                productSizeId,
                printShopId: entry.printShopId,
                stock: Math.max(0, entry.stock),
            });
        }
    }
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

    for (const size of input.sizes) {
        const sizeId = crypto.randomUUID();

        await db.insert(productSize).values({
            id: sizeId,
            productId,
            size: size.size.trim(),
        });

        await upsertSizeStocks(sizeId, size.stocks);
    }

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
                })
                .where(eq(productSize.id, size.id));

            await upsertSizeStocks(size.id, size.stocks);
        } else {
            const sizeId = crypto.randomUUID();

            await db.insert(productSize).values({
                id: sizeId,
                productId,
                size: size.size.trim(),
            });

            await upsertSizeStocks(sizeId, size.stocks);
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
