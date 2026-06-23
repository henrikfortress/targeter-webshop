import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { order } from '@/lib/db/schema';

export type OrderWithItems = {
    id: string;
    createdAt: Date;
    items: {
        id: string;
        quantity: number;
        productName: string;
        size: string;
        printShopName: string;
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
        },
        orderBy: desc(order.createdAt),
    });

    return orders.map((entry) => ({
        id: entry.id,
        createdAt: entry.createdAt,
        items: entry.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            productName: item.product.name,
            size: item.productSize.size,
            printShopName: item.printShop.name,
        })),
    }));
}
