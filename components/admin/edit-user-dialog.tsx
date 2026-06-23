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
import type { AdminUser } from '@/components/admin/users-table';

type EditUserDialogProps = {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const roles = [
    { value: 'user', label: 'Bruker' },
    { value: 'admin', label: 'Admin' },
] as const;

type EditUserFormProps = {
    user: AdminUser;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

function EditUserForm({ user, onOpenChange, onSuccess }: EditUserFormProps) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState<(typeof roles)[number]['value']>(user.role === 'admin' ? 'admin' : 'user');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setIsLoading(true);

        const { error: updateError } = await authClient.admin.updateUser({
            userId: user.id,
            data: {
                name,
                email,
            },
        });

        if (updateError) {
            setIsLoading(false);
            setError(updateError.message ?? 'Kunne ikke oppdatere bruker');
            return;
        }

        const currentRole = user.role === 'admin' ? 'admin' : 'user';
        if (role !== currentRole) {
            const { error: roleError } = await authClient.admin.setRole({
                userId: user.id,
                role,
            });

            if (roleError) {
                setIsLoading(false);
                setError(roleError.message ?? 'Kunne ikke oppdatere rolle');
                return;
            }
        }

        if (password) {
            const { error: passwordError } = await authClient.admin.setUserPassword({
                userId: user.id,
                newPassword: password,
            });

            if (passwordError) {
                setIsLoading(false);
                setError(passwordError.message ?? 'Kunne ikke oppdatere passord');
                return;
            }
        }

        setIsLoading(false);
        onOpenChange(false);
        onSuccess();
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="edit-name">Navn</Label>
                <Input id="edit-name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-email">E-post</Label>
                <Input
                    id="edit-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-role">Rolle</Label>
                <Select value={role} onValueChange={(value) => setRole(value as typeof role)}>
                    <SelectTrigger id="edit-role" className="w-full">
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
            <div className="space-y-2">
                <Label htmlFor="edit-password">Nytt passord</Label>
                <Input
                    id="edit-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="La stå tomt for å beholde"
                    minLength={8}
                />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Avbryt
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rediger bruker</DialogTitle>
                    <DialogDescription>
                        Oppdater brukerens detaljer. La passord stå tomt for å beholde nåværende.
                    </DialogDescription>
                </DialogHeader>
                {user ? (
                    <EditUserForm key={user.id} user={user} onOpenChange={onOpenChange} onSuccess={onSuccess} />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
