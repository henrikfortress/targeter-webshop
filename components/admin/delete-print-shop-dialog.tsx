'use client';

import { useState } from 'react';
import { deletePrintShop } from '@/lib/actions/print-shops';
import type { PrintShopRecord } from '@/lib/queries/print-shops';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DeletePrintShopDialogProps = {
    printShop: PrintShopRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export function DeletePrintShopDialog({ printShop, open, onOpenChange, onSuccess }: DeletePrintShopDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleDelete() {
        if (!printShop) return;

        setIsLoading(true);
        await deletePrintShop(printShop.id);
        setIsLoading(false);
        onOpenChange(false);
        onSuccess();
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Slett trykkeri</AlertDialogTitle>
                    <AlertDialogDescription>
                        Er du sikker på at du vil slette «{printShop?.name}»?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? 'Sletter...' : 'Slett'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
