'use client';

import { useState } from 'react';
import { createUser, getUserPrintShopId, setUserPrintShop } from '@/lib/actions/users';
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
import type { PrintShopRecord } from '@/lib/queries/print-shops';

type CreateUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    printShops: PrintShopRecord[];
};

const roles = [
    { value: 'user', label: 'Bruker' },
    { value: 'admin', label: 'Admin' },
    { value: 'print_shop', label: 'Trykkeri' },
] as const;

type RoleValue = (typeof roles)[number]['value'];

export function CreateUserDialog({ open, onOpenChange, onSuccess, printShops }: CreateUserDialogProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<RoleValue>('user');
    const [printShopId, setPrintShopId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function resetForm() {
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
        setPrintShopId('');
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

        if (role === 'print_shop' && !printShopId) {
            setError('Velg trykkeri for trykkeri-brukeren');
            return;
        }

        setIsLoading(true);

        const result = await createUser({
            email,
            password,
            name,
            role,
            printShopId: role === 'print_shop' ? printShopId : null,
        });

        setIsLoading(false);

        if ('error' in result && result.error) {
            setError(result.error);
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
                        <Select value={role} onValueChange={(value) => setRole(value as RoleValue)}>
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
                    {role === 'print_shop' ? (
                        <div className="space-y-2">
                            <Label htmlFor="create-print-shop">Trykkeri</Label>
                            <Select value={printShopId} onValueChange={setPrintShopId}>
                                <SelectTrigger id="create-print-shop" className="w-full">
                                    <SelectValue placeholder="Velg trykkeri" />
                                </SelectTrigger>
                                <SelectContent>
                                    {printShops.map((shop) => (
                                        <SelectItem key={shop.id} value={shop.id}>
                                            {shop.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : null}
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
