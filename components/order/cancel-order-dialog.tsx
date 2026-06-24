'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cancelOrder } from '@/lib/actions/orders';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type CancelOrderDialogProps = {
    orderId: string;
};

export function CancelOrderDialog({ orderId }: CancelOrderDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleCancel() {
        setError(null);
        setIsLoading(true);

        const result = await cancelOrder(orderId);

        setIsLoading(false);

        if ('error' in result && result.error) {
            setError(result.error);
            return;
        }

        setOpen(false);
        router.refresh();
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Kanseller bestilling
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Kanseller bestilling?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Dette kansellerer hele bestillingen hos alle trykkerier. Handlingen kan ikke angres.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
                    <Button variant="destructive" disabled={isLoading} onClick={handleCancel}>
                        {isLoading ? 'Kansellerer...' : 'Kanseller bestilling'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
