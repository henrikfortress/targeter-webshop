import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { order } from '@/lib/db/schema';
import type { FulfillmentStatus } from '@/lib/order-fulfillment/status';

export type OrderWithItems = {
    id: string;
    createdAt: Date;
    fulfillments: {
        id: string;
        printShopId: string;
        printShopName: string;
        status: FulfillmentStatus;
        updatedAt: Date;
    }[];
    items: {
        id: string;
        quantity: number;
        productName: string;
        size: string;
        printShopId: string;
        printShopName: string;
        fulfillmentStatus: FulfillmentStatus;
    }[];
};

export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const orders = await db.query.order.findMany({
        where: eq(order.userId, userId),
        with: {
            items: {
                with: {
                    product: true,
                    productSize: true,
                    printShop: true,
                },
            },
            fulfillments: {
                with: {
                    printShop: true,
                },
            },
        },
        orderBy: desc(order.createdAt),
    });

    return orders.map((entry) => {
        const fulfillmentByPrintShop = new Map(
            entry.fulfillments.map((fulfillment) => [
                fulfillment.printShopId,
                {
                    id: fulfillment.id,
                    printShopId: fulfillment.printShopId,
                    printShopName: fulfillment.printShop.name,
                    status: fulfillment.status as FulfillmentStatus,
                    updatedAt: fulfillment.updatedAt,
                },
            ]),
        );

        return {
            id: entry.id,
            createdAt: entry.createdAt,
            fulfillments: entry.fulfillments.map((fulfillment) => ({
                id: fulfillment.id,
                printShopId: fulfillment.printShopId,
                printShopName: fulfillment.printShop.name,
                status: fulfillment.status as FulfillmentStatus,
                updatedAt: fulfillment.updatedAt,
            })),
            items: entry.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                productName: item.product.name,
                size: item.productSize.size,
                printShopId: item.printShopId,
                printShopName: item.printShop.name,
                fulfillmentStatus:
                    fulfillmentByPrintShop.get(item.printShopId)?.status ?? ('pending' as FulfillmentStatus),
            })),
        };
    });
}
