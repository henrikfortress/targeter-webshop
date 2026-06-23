import { UsersTable } from '@/components/admin/users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminUsersPage() {
    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold">Brukere</h1>
                <p className="text-sm text-muted-foreground">Styr brukertilgang til webshoppen.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Alle brukere</CardTitle>
                    <CardDescription>Registrerte brukere og deres roller.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersTable />
                </CardContent>
            </Card>
        </>
    );
}
