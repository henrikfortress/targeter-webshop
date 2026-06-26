import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { product } from '@/lib/db/schema';
import { getStockForShop } from '@/lib/product-stock';
import type { ProductWithSizes } from '@/lib/queries/products';

export type PrintShopProduct = ProductWithSizes & {
    canDelete: boolean;
    canEditDetails: boolean;
};

function mapProductSizes(
    sizes: { id: string; size: string; stocks: { printShopId: string; stock: number }[] }[],
    printShopId: string,
) {
    return [...sizes]
        .sort((a, b) => a.size.localeCompare(b.size))
        .map((size) => ({
            id: size.id,
            size: size.size,
            stocks: size.stocks.map((entry) => ({
                printShopId: entry.printShopId,
                stock: entry.stock,
            })),
            ownStock: getStockForShop(
                size.stocks.map((entry) => ({
                    printShopId: entry.printShopId,
                    stock: entry.stock,
                })),
                printShopId,
            ),
            hasOtherShopStock: size.stocks.some((entry) => entry.printShopId !== printShopId && entry.stock > 0),
        }));
}

export async function getPrintShopProducts(printShopId: string): Promise<PrintShopProduct[]> {
    const products = await db.query.product.findMany({
        with: {
            sizes: {
                with: {
                    stocks: true,
                },
            },
        },
        orderBy: asc(product.name),
    });

    return products.map((item) => {
        const sizes = mapProductSizes(item.sizes, printShopId);
        const hasOtherShopStock = sizes.some((size) => size.hasOtherShopStock);

        return {
            id: item.id,
            name: item.name,
            description: item.description,
            active: item.active,
            sizes: sizes.map(({ id, size, stocks }) => ({ id, size, stocks })),
            canDelete: !hasOtherShopStock,
            canEditDetails: !hasOtherShopStock,
        };
    });
}
