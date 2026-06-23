import Link from 'next/link';
import { UsersTable } from '@/components/admin/users-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Admin</h1>
                    <p className="text-sm text-muted-foreground">Styr brukertilgang til webshoppen.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/">Tilbake til hjem</Link>
                </Button>
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
        </main>
    );
}
