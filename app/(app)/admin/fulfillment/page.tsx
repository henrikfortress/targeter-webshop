import { PrintShopsTable } from '@/components/admin/print-shops-table';
import { getAllPrintShops } from '@/lib/queries/print-shops';

export default async function AdminFulfillmentPage() {
    const printShops = await getAllPrintShops();

    return (
        <>
            <h1 className="text-2xl font-semibold">Trykkeri</h1>
            <PrintShopsTable printShops={printShops} />
        </>
    );
}
