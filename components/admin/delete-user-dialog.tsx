'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '@/components/admin/users-table';

type DeleteUserDialogProps = {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export function DeleteUserDialog({ user, open, onOpenChange, onSuccess }: DeleteUserDialogProps) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleDelete() {
        if (!user) return;

        setError(null);
        setIsLoading(true);

        const { error: deleteError } = await authClient.admin.removeUser({
            userId: user.id,
        });

        setIsLoading(false);

        if (deleteError) {
            setError(deleteError.message ?? 'Kunne ikke slette bruker');
            return;
        }

        onOpenChange(false);
        onSuccess();
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setError(null);
        }
        onOpenChange(nextOpen);
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Slett bruker</AlertDialogTitle>
                    <AlertDialogDescription>
                        Er du sikker på at du vil slette {user?.name ?? 'denne brukeren'} ({user?.email})? Dette kan
                        ikke angres.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? 'Sletter...' : 'Slett bruker'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
