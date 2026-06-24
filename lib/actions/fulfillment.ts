'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requirePrintShopSession } from '@/lib/actions/auth';
import { sendStatusUpdateEmail } from '@/lib/email/send-status-update-email';
import { db } from '@/lib/db';
import { orderFulfillment } from '@/lib/db/schema';
import { canUpdateFulfillmentStatus, getNextStatuses, type FulfillmentStatus } from '@/lib/order-fulfillment/status';

export async function updateFulfillmentStatus(input: { fulfillmentId: string; status: FulfillmentStatus }) {
    const { printShopId } = await requirePrintShopSession();

    const fulfillment = await db.query.orderFulfillment.findFirst({
        where: eq(orderFulfillment.id, input.fulfillmentId),
        with: {
            printShop: true,
            order: {
                with: {
                    user: true,
                    items: {
                        with: {
                            product: true,
                            productSize: true,
                        },
                    },
                },
            },
        },
    });

    if (!fulfillment) {
        return { error: 'Bestillingen ble ikke funnet' };
    }

    if (fulfillment.printShopId !== printShopId) {
        return { error: 'Ikke autorisert' };
    }

    const currentStatus = fulfillment.status as FulfillmentStatus;

    if (!canUpdateFulfillmentStatus(currentStatus)) {
        return { error: 'Status kan ikke endres lenger' };
    }

    const nextStatuses = getNextStatuses(currentStatus);

    if (!nextStatuses.includes(input.status)) {
        return { error: 'Ugyldig statusovergang' };
    }

    const previousStatus = currentStatus;
    const updatedAt = new Date();

    await db.update(orderFulfillment).set({ status: input.status }).where(eq(orderFulfillment.id, input.fulfillmentId));

    const shopItems = fulfillment.order.items
        .filter((item) => item.printShopId === printShopId)
        .map((item) => ({
            productName: item.product.name,
            size: item.productSize.size,
            quantity: item.quantity,
        }));

    await sendStatusUpdateEmail({
        fulfillmentId: fulfillment.id,
        orderId: fulfillment.orderId,
        previousStatus,
        newStatus: input.status,
        printShopName: fulfillment.printShop.name,
        printShopEmail: fulfillment.printShop.email,
        userEmail: fulfillment.order.user.email,
        userName: fulfillment.order.user.name,
        items: shopItems,
        updatedAt,
    });

    revalidatePath('/print-shop/orders');
    revalidatePath('/orders');

    return { success: true, status: input.status };
}
