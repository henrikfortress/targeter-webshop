import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orderFulfillment } from '@/lib/db/schema';
import type { FulfillmentStatus } from '@/lib/order-fulfillment/status';

export type PrintShopOrder = {
    fulfillmentId: string;
    orderId: string;
    status: FulfillmentStatus;
    createdAt: Date;
    updatedAt: Date;
    customerName: string;
    customerEmail: string;
    items: {
        id: string;
        productName: string;
        size: string;
        quantity: number;
    }[];
};

export async function getPrintShopOrders(printShopId: string): Promise<PrintShopOrder[]> {
    const fulfillments = await db.query.orderFulfillment.findMany({
        where: eq(orderFulfillment.printShopId, printShopId),
        with: {
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
        orderBy: desc(orderFulfillment.createdAt),
    });

    return fulfillments.map((fulfillment) => ({
        fulfillmentId: fulfillment.id,
        orderId: fulfillment.orderId,
        status: fulfillment.status as FulfillmentStatus,
        createdAt: fulfillment.order.createdAt,
        updatedAt: fulfillment.updatedAt,
        customerName: fulfillment.order.user.name,
        customerEmail: fulfillment.order.user.email,
        items: fulfillment.order.items
            .filter((item) => item.printShopId === printShopId)
            .map((item) => ({
                id: item.id,
                productName: item.product.name,
                size: item.productSize.size,
                quantity: item.quantity,
            })),
    }));
}
