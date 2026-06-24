import { ProductsTable } from '@/components/admin/products-table';
import { getAllProducts } from '@/lib/queries/products';
import { getAllPrintShops } from '@/lib/queries/print-shops';

export default async function AdminProductsPage() {
    const [products, printShops] = await Promise.all([getAllProducts(), getAllPrintShops()]);

    return (
        <>
            <h1 className="text-2xl font-semibold">Produkter</h1>
            <ProductsTable products={products} printShops={printShops} />
        </>
    );
}
