'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { order, orderItem, printShop, productSize, productSizeStock } from '@/lib/db/schema';

export type OrderItemInput = {
    productId: string;
    productSizeId: string;
    productName: string;
    size: string;
    quantity: number;
    printShopId: string;
};

export type SubmitOrderInput = {
    items: OrderItemInput[];
};

export async function submitOrder(input: SubmitOrderInput) {
    const session = await requireSession();

    if (input.items.length === 0) {
        return { error: 'Bestillingen er tom' };
    }

    const printShopIds = [...new Set(input.items.map((item) => item.printShopId))];
    const shops = await db.query.printShop.findMany({
        where: inArray(printShop.id, printShopIds),
    });
    const shopMap = new Map(shops.map((shop) => [shop.id, shop]));

    for (const item of input.items) {
        if (!item.printShopId) {
            return { error: `Velg trykkeri for ${item.productName}` };
        }

        const shop = shopMap.get(item.printShopId);
        if (!shop || !shop.active) {
            return { error: `Ugyldig trykkeri for ${item.productName}` };
        }
    }

    const sizeIds = input.items.map((item) => item.productSizeId);
    const sizes = await db.query.productSize.findMany({
        where: inArray(productSize.id, sizeIds),
        with: { product: true, stocks: true },
    });

    const sizeMap = new Map(sizes.map((size) => [size.id, size]));

    for (const item of input.items) {
        const sizeRecord = sizeMap.get(item.productSizeId);

        if (!sizeRecord || !sizeRecord.product.active) {
            return { error: `Produktet «${item.productName}» er ikke tilgjengelig` };
        }

        if (item.quantity <= 0) {
            return { error: 'Ugyldig antall' };
        }

        const stockRecord = sizeRecord.stocks.find((entry) => entry.printShopId === item.printShopId);
        const availableStock = stockRecord?.stock ?? 0;

        if (item.quantity > availableStock) {
            const shopName = shopMap.get(item.printShopId)?.name ?? 'valgt trykkeri';
            return {
                error: `Ikke nok på lager for ${item.productName} (${item.size}) hos ${shopName}. Tilgjengelig: ${availableStock}`,
            };
        }
    }

    const orderId = crypto.randomUUID();

    await db.insert(order).values({
        id: orderId,
        userId: session.user.id,
    });

    await db.insert(orderItem).values(
        input.items.map((item) => ({
            id: crypto.randomUUID(),
            orderId,
            productId: item.productId,
            productSizeId: item.productSizeId,
            printShopId: item.printShopId,
            quantity: item.quantity,
        })),
    );

    for (const item of input.items) {
        const sizeRecord = sizeMap.get(item.productSizeId)!;
        const stockRecord = sizeRecord.stocks.find((entry) => entry.printShopId === item.printShopId)!;

        await db
            .update(productSizeStock)
            .set({ stock: stockRecord.stock - item.quantity })
            .where(
                and(
                    eq(productSizeStock.productSizeId, item.productSizeId),
                    eq(productSizeStock.printShopId, item.printShopId),
                ),
            );
    }

    const orderPayload = {
        orderId,
        userId: session.user.id,
        userEmail: session.user.email,
        items: input.items.map((item) => ({
            product: item.productName,
            size: item.size,
            quantity: item.quantity,
            printShop: shopMap.get(item.printShopId)?.name,
        })),
        submittedAt: new Date().toISOString(),
    };

    console.log('[ORDER SUBMITTED]', JSON.stringify(orderPayload, null, 2));

    revalidatePath('/');
    revalidatePath('/orders');

    return { success: true, orderId };
}
