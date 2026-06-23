import { ProductCatalog } from '@/components/shop/product-catalog';
import { getActivePrintShops } from '@/lib/queries/print-shops';
import { getActiveProducts } from '@/lib/queries/products';

export default async function Home() {
    const [products, printShops] = await Promise.all([getActiveProducts(), getActivePrintShops()]);

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold">Produkter</h1>
                <p className="text-sm text-muted-foreground">
                    Velg størrelse, trykkeri og legg produkter i bestillingen din.
                </p>
            </div>
            <ProductCatalog products={products} printShops={printShops} />
        </>
    );
}
