import { PrintShopOrdersTable } from '@/components/print-shop/print-shop-orders-table';
import { requirePrintShopSession } from '@/lib/actions/auth';
import { getPrintShopOrders } from '@/lib/queries/print-shop-orders';

export default async function PrintShopOrdersPage() {
    const { printShopId } = await requirePrintShopSession();
    const orders = await getPrintShopOrders(printShopId);

    return (
        <>
            <h1 className="text-2xl font-semibold">Bestillinger</h1>
            <PrintShopOrdersTable orders={orders} />
        </>
    );
}
