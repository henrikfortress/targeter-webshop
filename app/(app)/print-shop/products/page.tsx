import { PrintShopProductsTable } from '@/components/print-shop/print-shop-products-table';
import { requirePrintShopSession } from '@/lib/actions/auth';
import { getPrintShopProducts } from '@/lib/queries/print-shop-products';

export default async function PrintShopProductsPage() {
    const { printShopId } = await requirePrintShopSession();
    const products = await getPrintShopProducts(printShopId);

    return (
        <>
            <h1 className="text-2xl font-semibold">Produkter</h1>
            <PrintShopProductsTable products={products} printShopId={printShopId} />
        </>
    );
}
