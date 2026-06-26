'use server';

import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requirePrintShopSession } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { orderItem, product, productSize, productSizeStock } from '@/lib/db/schema';

export type PrintShopProductSizeInput = {
    id?: string;
    size: string;
    stock: number;
};

export type PrintShopProductInput = {
    name: string;
    description: string;
    sizes: PrintShopProductSizeInput[];
};

function revalidatePrintShopProductPaths() {
    revalidatePath('/');
    revalidatePath('/print-shop/products');
    revalidatePath('/admin/products');
}

async function upsertOwnStock(productSizeId: string, printShopId: string, stock: number) {
    const existing = await db.query.productSizeStock.findFirst({
        where: and(eq(productSizeStock.productSizeId, productSizeId), eq(productSizeStock.printShopId, printShopId)),
    });

    const normalizedStock = Math.max(0, stock);

    if (existing) {
        await db.update(productSizeStock).set({ stock: normalizedStock }).where(eq(productSizeStock.id, existing.id));
        return;
    }

    if (normalizedStock === 0) {
        return;
    }

    await db.insert(productSizeStock).values({
        id: crypto.randomUUID(),
        productSizeId,
        printShopId,
        stock: normalizedStock,
    });
}

async function sizeHasOtherShopStock(productSizeId: string, printShopId: string) {
    const otherStock = await db.query.productSizeStock.findFirst({
        where: and(eq(productSizeStock.productSizeId, productSizeId), ne(productSizeStock.printShopId, printShopId)),
        columns: { id: true, stock: true },
    });

    return Boolean(otherStock && otherStock.stock > 0);
}

export async function productHasOtherShopStock(productId: string, printShopId: string) {
    const sizes = await db.query.productSize.findMany({
        where: eq(productSize.productId, productId),
        with: {
            stocks: true,
        },
    });

    return sizes.some((size) => size.stocks.some((entry) => entry.printShopId !== printShopId && entry.stock > 0));
}

export async function createPrintShopProduct(input: PrintShopProductInput) {
    const { printShopId } = await requirePrintShopSession();

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
        active: true,
    });

    for (const size of input.sizes) {
        const sizeId = crypto.randomUUID();

        await db.insert(productSize).values({
            id: sizeId,
            productId,
            size: size.size.trim(),
        });

        await upsertOwnStock(sizeId, printShopId, size.stock);
    }

    revalidatePrintShopProductPaths();
    return { success: true };
}

export async function updatePrintShopProduct(productId: string, input: PrintShopProductInput) {
    const { printShopId } = await requirePrintShopSession();

    if (!input.name.trim()) {
        return { error: 'Produktnavn er påkrevd' };
    }

    if (input.sizes.length === 0) {
        return { error: 'Legg til minst én størrelse' };
    }

    const existingProduct = await db.query.product.findFirst({
        where: eq(product.id, productId),
        columns: { id: true },
    });

    if (!existingProduct) {
        return { error: 'Produktet finnes ikke' };
    }

    const hasOtherShopStock = await productHasOtherShopStock(productId, printShopId);

    if (!hasOtherShopStock) {
        await db
            .update(product)
            .set({
                name: input.name.trim(),
                description: input.description.trim() || null,
            })
            .where(eq(product.id, productId));
    }

    const existingSizes = await db.query.productSize.findMany({
        where: eq(productSize.productId, productId),
    });

    const incomingIds = new Set(input.sizes.filter((size) => size.id).map((size) => size.id!));

    for (const size of existingSizes) {
        if (incomingIds.has(size.id)) {
            continue;
        }

        if (await sizeHasOtherShopStock(size.id, printShopId)) {
            return {
                error: 'Størrelsen kan ikke fjernes fordi andre trykkerier har lager på den.',
            };
        }

        await db.delete(productSize).where(eq(productSize.id, size.id));
    }

    for (const size of input.sizes) {
        if (size.id) {
            const existingSize = existingSizes.find((entry) => entry.id === size.id);

            if (!existingSize) {
                return { error: 'Ugyldig størrelse' };
            }

            if (!hasOtherShopStock) {
                await db.update(productSize).set({ size: size.size.trim() }).where(eq(productSize.id, size.id));
            }

            await upsertOwnStock(size.id, printShopId, size.stock);
            continue;
        }

        const sizeId = crypto.randomUUID();

        await db.insert(productSize).values({
            id: sizeId,
            productId,
            size: size.size.trim(),
        });

        await upsertOwnStock(sizeId, printShopId, size.stock);
    }

    revalidatePrintShopProductPaths();
    return { success: true };
}

export async function deletePrintShopProduct(productId: string) {
    const { printShopId } = await requirePrintShopSession();

    const existingProduct = await db.query.product.findFirst({
        where: eq(product.id, productId),
        columns: { id: true },
    });

    if (!existingProduct) {
        return { error: 'Produktet finnes ikke' };
    }

    if (await productHasOtherShopStock(productId, printShopId)) {
        return {
            error: 'Produktet kan ikke slettes fordi andre trykkerier har lager på det.',
        };
    }

    const referencedInOrder = await db.query.orderItem.findFirst({
        where: eq(orderItem.productId, productId),
        columns: { id: true },
    });

    if (referencedInOrder) {
        return {
            error: 'Produktet kan ikke slettes fordi det finnes i bestillinger.',
        };
    }

    await db.delete(product).where(eq(product.id, productId));

    revalidatePrintShopProductPaths();
    return { success: true };
}
