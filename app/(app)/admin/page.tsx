import { UsersTable } from '@/components/admin/users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold">Admin</h1>
                <p className="text-sm text-muted-foreground">Styr brukertilgang til webshoppen.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Brukere</CardTitle>
                    <CardDescription>Alle registrerte brukere og deres roller.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersTable />
                </CardContent>
            </Card>
        </>
    );
}
