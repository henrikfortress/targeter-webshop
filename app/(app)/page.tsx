import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold">Hjem</h1>
                <p className="text-sm text-muted-foreground">Velkommen til Targeter Webshop.</p>
            </div>
            {user?.name || user?.email ? (
                <p className="text-sm text-muted-foreground">
                    Du er logget inn som {user.email}
                    {user.name ? ` (${user.name})` : ''}.
                </p>
            ) : null}
        </>
    );
}
