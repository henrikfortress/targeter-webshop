import { UsersTable } from '@/components/admin/users-table';
import { getAllPrintShops } from '@/lib/queries/print-shops';

export default async function AdminUsersPage() {
    const printShops = await getAllPrintShops();

    return (
        <>
            <h1 className="text-2xl font-semibold">Brukere</h1>
            <UsersTable printShops={printShops} />
        </>
    );
}
