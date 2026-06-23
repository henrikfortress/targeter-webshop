'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CreateUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const roles = [
    { value: 'user', label: 'Bruker' },
    { value: 'admin', label: 'Admin' },
] as const;

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<(typeof roles)[number]['value']>('user');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function resetForm() {
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
        setError(null);
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            resetForm();
        }
        onOpenChange(nextOpen);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error: createError } = await authClient.admin.createUser({
            email,
            password,
            name,
            role,
        });

        setIsLoading(false);

        if (createError) {
            setError(createError.message ?? 'Kunne ikke opprette bruker');
            return;
        }

        resetForm();
        onOpenChange(false);
        onSuccess();
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Opprett bruker</DialogTitle>
                    <DialogDescription>Legg til en ny bruker med e-post og passord.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="create-name">Navn</Label>
                        <Input
                            id="create-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Ola Nordmann"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-email">E-post</Label>
                        <Input
                            id="create-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="ola@nordmann.no"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-password">Passord</Label>
                        <Input
                            id="create-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="********"
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-role">Rolle</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as typeof role)}>
                            <SelectTrigger id="create-role" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Avbryt
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Oppretter...' : 'Opprett bruker'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
