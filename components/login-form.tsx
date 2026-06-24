'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDefaultRouteForRole } from '@/lib/auth-utils';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error: signInError } = await authClient.signIn.email({
            email,
            password,
        });

        const session = await authClient.getSession();

        setIsLoading(false);

        if (signInError) {
            setError(signInError.message ?? 'Unable to sign in');
            return;
        }

        const role = session.data?.user.role;
        router.push(getDefaultRouteForRole(role));
        router.refresh();
    }

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader>
                <CardTitle>Logg inn</CardTitle>
                <CardDescription>Logg inn for å få tilgang til webshoppen.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-post</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="ola@nordmann.no"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Passord</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="********"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
