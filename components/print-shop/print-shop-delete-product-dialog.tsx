'use client';

import { useState } from 'react';
import { deletePrintShopProduct } from '@/lib/actions/print-shop-products';
import type { PrintShopProduct } from '@/lib/queries/print-shop-products';
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

type PrintShopDeleteProductDialogProps = {
    product: PrintShopProduct | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export function PrintShopDeleteProductDialog({
    product,
    open,
    onOpenChange,
    onSuccess,
}: PrintShopDeleteProductDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        if (!product) return;

        setIsLoading(true);
        setError(null);

        const result = await deletePrintShopProduct(product.id);

        setIsLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        onOpenChange(false);
        onSuccess();
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Slett produkt</AlertDialogTitle>
                    <AlertDialogDescription>
                        Er du sikker på at du vil slette «{product?.name}»? Dette kan ikke angres.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
