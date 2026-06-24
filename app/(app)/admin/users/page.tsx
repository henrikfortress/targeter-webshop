import { UsersTable } from '@/components/admin/users-table';

export default function AdminUsersPage() {
    return (
        <>
            <h1 className="text-2xl font-semibold">Brukere</h1>
            <UsersTable />
        </>
    );
}
