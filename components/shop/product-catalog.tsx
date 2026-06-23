'use client';

import type { ProductWithSizes } from '@/lib/queries/products';
import type { PrintShopRecord } from '@/lib/queries/print-shops';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart/cart-provider';

type ProductCatalogProps = {
    products: ProductWithSizes[];
    printShops: PrintShopRecord[];
};

export function ProductCatalog({ products, printShops }: ProductCatalogProps) {
    const { itemCount, openOrderSheet } = useCart();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    {products.length} produkt{products.length === 1 ? '' : 'er'} tilgjengelig
                </p>
                {itemCount > 0 ? (
                    <Button variant="outline" onClick={openOrderSheet}>
                        Se bestilling ({itemCount})
                    </Button>
                ) : null}
            </div>
            {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ingen produkter er tilgjengelige akkurat nå.</p>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} printShops={printShops} />
                    ))}
                </div>
            )}
        </div>
    );
}
