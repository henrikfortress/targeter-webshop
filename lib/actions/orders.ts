'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/actions/auth';
import { sendFulfillmentEmail } from '@/lib/email/send-fulfillment-email';
import { sendStatusUpdateEmail } from '@/lib/email/send-status-update-email';
import { db } from '@/lib/db';
import { order, orderFulfillment, orderItem, printShop, productSize, productSizeStock } from '@/lib/db/schema';
import { canCancelOrder, type FulfillmentStatus } from '@/lib/order-fulfillment/status';

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
    const submittedAt = new Date();

    await db.insert(order).values({
        id: orderId,
        userId: session.user.id,
    });

    const insertedItems = input.items.map((item) => ({
        id: crypto.randomUUID(),
        orderId,
        productId: item.productId,
        productSizeId: item.productSizeId,
        printShopId: item.printShopId,
        quantity: item.quantity,
    }));

    await db.insert(orderItem).values(insertedItems);

    const itemsByPrintShop = new Map<string, typeof input.items>();

    for (const item of input.items) {
        const existing = itemsByPrintShop.get(item.printShopId) ?? [];
        existing.push(item);
        itemsByPrintShop.set(item.printShopId, existing);
    }

    const fulfillmentRecords = [...itemsByPrintShop.entries()].map(([printShopId]) => ({
        id: crypto.randomUUID(),
        orderId,
        printShopId,
        status: 'pending' as const,
    }));

    await db.insert(orderFulfillment).values(fulfillmentRecords);

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

    for (const fulfillment of fulfillmentRecords) {
        const shop = shopMap.get(fulfillment.printShopId)!;
        const shopItems = itemsByPrintShop.get(fulfillment.printShopId)!;

        const emailResult = await sendFulfillmentEmail({
            fulfillmentId: fulfillment.id,
            orderId,
            printShopName: shop.name,
            printShopEmail: shop.email,
            userEmail: session.user.email,
            userName: session.user.name,
            items: shopItems.map((item) => ({
                productName: item.productName,
                size: item.size,
                quantity: item.quantity,
            })),
            submittedAt,
        });

        if ('success' in emailResult && emailResult.success) {
            await db
                .update(orderFulfillment)
                .set({
                    status: 'sent',
                    resendEmailId: emailResult.emailId ?? null,
                })
                .where(eq(orderFulfillment.id, fulfillment.id));
        }
    }

    revalidatePath('/');
    revalidatePath('/orders');

    return { success: true, orderId };
}

export async function cancelOrder(orderId: string) {
    const session = await requireSession();

    const orderRecord = await db.query.order.findFirst({
        where: eq(order.id, orderId),
        with: {
            fulfillments: {
                with: {
                    printShop: true,
                },
            },
            items: {
                with: {
                    product: true,
                    productSize: true,
                    printShop: true,
                },
            },
        },
    });

    if (!orderRecord) {
        return { error: 'Bestillingen ble ikke funnet' };
    }

    if (orderRecord.userId !== session.user.id) {
        return { error: 'Ikke autorisert' };
    }

    const fulfillments = orderRecord.fulfillments.map((entry) => ({
        status: entry.status as FulfillmentStatus,
    }));

    if (!canCancelOrder(fulfillments)) {
        return { error: 'Bestillingen kan ikke kanselleres lenger' };
    }

    const updatedAt = new Date();

    for (const fulfillment of orderRecord.fulfillments) {
        const previousStatus = fulfillment.status as FulfillmentStatus;

        await db.update(orderFulfillment).set({ status: 'cancelled' }).where(eq(orderFulfillment.id, fulfillment.id));

        const shopItems = orderRecord.items
            .filter((item) => item.printShopId === fulfillment.printShopId)
            .map((item) => ({
                productName: item.product.name,
                size: item.productSize.size,
                quantity: item.quantity,
            }));

        await sendStatusUpdateEmail({
            fulfillmentId: fulfillment.id,
            orderId: orderRecord.id,
            previousStatus,
            newStatus: 'cancelled',
            printShopName: fulfillment.printShop.name,
            printShopEmail: fulfillment.printShop.email,
            userEmail: session.user.email,
            userName: session.user.name,
            items: shopItems,
            updatedAt,
        });
    }

    for (const item of orderRecord.items) {
        const stockRecord = await db.query.productSizeStock.findFirst({
            where: and(
                eq(productSizeStock.productSizeId, item.productSizeId),
                eq(productSizeStock.printShopId, item.printShopId),
            ),
        });

        if (stockRecord) {
            await db
                .update(productSizeStock)
                .set({ stock: stockRecord.stock + item.quantity })
                .where(
                    and(
                        eq(productSizeStock.productSizeId, item.productSizeId),
                        eq(productSizeStock.printShopId, item.printShopId),
                    ),
                );
        }
    }

    revalidatePath('/orders');
    revalidatePath('/print-shop/orders');
    revalidatePath('/');

    return { success: true };
}
