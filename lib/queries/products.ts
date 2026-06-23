import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { product } from '@/lib/db/schema';
import type { ProductSizeStock } from '@/lib/product-stock';

export type { ProductSizeStock } from '@/lib/product-stock';

export type ProductWithSizes = {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    sizes: {
        id: string;
        size: string;
        stocks: ProductSizeStock[];
    }[];
};

function mapProductSizes(sizes: { id: string; size: string; stocks: { printShopId: string; stock: number }[] }[]) {
    return [...sizes]
        .sort((a, b) => a.size.localeCompare(b.size))
        .map((size) => ({
            id: size.id,
            size: size.size,
            stocks: size.stocks.map((entry) => ({
                printShopId: entry.printShopId,
                stock: entry.stock,
            })),
        }));
}

export async function getActiveProducts(): Promise<ProductWithSizes[]> {
    const products = await db.query.product.findMany({
        where: eq(product.active, true),
        with: {
            sizes: {
                with: {
                    stocks: true,
                },
            },
        },
        orderBy: asc(product.name),
    });

    return products.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        active: item.active,
        sizes: mapProductSizes(item.sizes),
    }));
}

export async function getAllProducts(): Promise<ProductWithSizes[]> {
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

    return products.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        active: item.active,
        sizes: mapProductSizes(item.sizes),
    }));
}

export async function getProductStockBySizeIds(sizeIds: string[]) {
    if (sizeIds.length === 0) return [];

    const sizes = await db.query.productSize.findMany({
        where: (fields, { inArray }) => inArray(fields.id, sizeIds),
        with: {
            product: true,
            stocks: true,
        },
    });

    return sizes;
}
