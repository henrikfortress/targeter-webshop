import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { product } from '@/lib/db/schema';

export type ProductWithSizes = {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    sizes: {
        id: string;
        size: string;
        stock: number;
    }[];
};

export async function getActiveProducts(): Promise<ProductWithSizes[]> {
    const products = await db.query.product.findMany({
        where: eq(product.active, true),
        with: {
            sizes: true,
        },
        orderBy: asc(product.name),
    });

    return products.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        active: item.active,
        sizes: [...item.sizes]
            .sort((a, b) => a.size.localeCompare(b.size))
            .map((size) => ({
                id: size.id,
                size: size.size,
                stock: size.stock,
            })),
    }));
}

export async function getAllProducts(): Promise<ProductWithSizes[]> {
    const products = await db.query.product.findMany({
        with: {
            sizes: true,
        },
        orderBy: asc(product.name),
    });

    return products.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        active: item.active,
        sizes: [...item.sizes]
            .sort((a, b) => a.size.localeCompare(b.size))
            .map((size) => ({
                id: size.id,
                size: size.size,
                stock: size.stock,
            })),
    }));
}

export async function getProductStockBySizeIds(sizeIds: string[]) {
    if (sizeIds.length === 0) return [];

    const sizes = await db.query.productSize.findMany({
        where: (fields, { inArray }) => inArray(fields.id, sizeIds),
        with: {
            product: true,
        },
    });

    return sizes;
}
