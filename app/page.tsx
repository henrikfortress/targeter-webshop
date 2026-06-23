import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { hasAdminRole } from '@/lib/auth-utils';
import { SignOutButton } from '@/components/sign-out-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    const isAdmin = hasAdminRole(user?.role);

    return (
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Targeter Webshop</h1>
                <SignOutButton />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Hei{user?.name ? `, ${user.name}` : ''}</CardTitle>
                    <CardDescription>Du er logget inn som {user?.email}.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {isAdmin ? (
                        <Button asChild>
                            <Link href="/admin">Gå til admin</Link>
                        </Button>
                    ) : null}
                </CardContent>
            </Card>
        </main>
    );
}
