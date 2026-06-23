'use client';

import { useEffect, useState } from 'react';
import { createPrintShop, updatePrintShop, type PrintShopInput } from '@/lib/actions/print-shops';
import type { PrintShopRecord } from '@/lib/queries/print-shops';
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

type PrintShopDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    printShop?: PrintShopRecord | null;
};

export function PrintShopDialog({ open, onOpenChange, onSuccess, printShop }: PrintShopDialogProps) {
    const isEditing = Boolean(printShop);
    const [name, setName] = useState(printShop?.name ?? '');
    const [email, setEmail] = useState(printShop?.email ?? '');
    const [active, setActive] = useState(printShop?.active ?? true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function resetForm() {
        setName(printShop?.name ?? '');
        setEmail(printShop?.email ?? '');
        setActive(printShop?.active ?? true);
        setError(null);
    }

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, printShop]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const payload: PrintShopInput = { name, email, active };
        const result = printShop ? await updatePrintShop(printShop.id, payload) : await createPrintShop(payload);

        setIsLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        onOpenChange(false);
        onSuccess();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Rediger trykkeri' : 'Nytt trykkeri'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Oppdater navn, e-post og tilgjengelighet for trykkeriet.'
                            : 'Legg til et trykkeri brukere kan velge ved bestilling.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="print-shop-name">Navn</Label>
                        <Input
                            id="print-shop-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Oslo Trykk AS"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="print-shop-email">E-post</Label>
                        <Input
                            id="print-shop-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="kontakt@oslotrykk.no"
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(event) => setActive(event.target.checked)}
                            className="size-4 rounded border"
                        />
                        Aktivt trykkeri
                    </label>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Avbryt
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Lagrer...' : isEditing ? 'Lagre endringer' : 'Opprett trykkeri'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
