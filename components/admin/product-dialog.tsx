'use client';

import { useEffect, useState } from 'react';
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { createProduct, updateProduct, type ProductSizeInput } from '@/lib/actions/products';
import type { ProductWithSizes } from '@/lib/queries/products';
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
import { Textarea } from '@/components/ui/textarea';

type ProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    product?: ProductWithSizes | null;
};

type SizeRow = ProductSizeInput & { key: string };

function createSizeRow(size?: ProductSizeInput): SizeRow {
    return {
        key: size?.id ?? crypto.randomUUID(),
        id: size?.id,
        size: size?.size ?? '',
        stock: size?.stock ?? 0,
    };
}

export function ProductDialog({ open, onOpenChange, onSuccess, product }: ProductDialogProps) {
    const isEditing = Boolean(product);
    const [name, setName] = useState(product?.name ?? '');
    const [description, setDescription] = useState(product?.description ?? '');
    const [active, setActive] = useState(product?.active ?? true);
    const [sizes, setSizes] = useState<SizeRow[]>(
        product?.sizes.length ? product.sizes.map((size) => createSizeRow(size)) : [createSizeRow()],
    );
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function resetForm() {
        setName(product?.name ?? '');
        setDescription(product?.description ?? '');
        setActive(product?.active ?? true);
        setSizes(product?.sizes.length ? product.sizes.map((size) => createSizeRow(size)) : [createSizeRow()]);
        setError(null);
    }

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, product]);

    function updateSizeRow(key: string, patch: Partial<SizeRow>) {
        setSizes((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    }

    function addSizeRow() {
        setSizes((current) => [...current, createSizeRow()]);
    }

    function removeSizeRow(key: string) {
        setSizes((current) => (current.length <= 1 ? current : current.filter((row) => row.key !== key)));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const payload = {
            name,
            description,
            active,
            sizes: sizes.map(({ id, size, stock }) => ({ id, size, stock: Number(stock) || 0 })),
        };

        const result = product ? await updateProduct(product.id, payload) : await createProduct(payload);

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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Rediger produkt' : 'Nytt produkt'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Oppdater produktinformasjon og lagerbeholdning.'
                            : 'Legg til et nytt produkt med størrelser og lager.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="product-name">Navn</Label>
                        <Input
                            id="product-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-description">Beskrivelse</Label>
                        <Textarea
                            id="product-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={3}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(event) => setActive(event.target.checked)}
                            className="size-4 rounded border"
                        />
                        Aktivt produkt
                    </label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Størrelser og lager</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addSizeRow}>
                                <PlusIcon data-icon="inline-start" />
                                Størrelse
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {sizes.map((row) => (
                                <div key={row.key} className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-muted-foreground">Størrelse</Label>
                                        <Input
                                            value={row.size}
                                            onChange={(event) => updateSizeRow(row.key, { size: event.target.value })}
                                            placeholder="M"
                                            required
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-xs text-muted-foreground">Lager</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={row.stock}
                                            onChange={(event) =>
                                                updateSizeRow(row.key, { stock: Number(event.target.value) })
                                            }
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => removeSizeRow(row.key)}
                                        aria-label="Fjern størrelse"
                                    >
                                        <MinusIcon />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Avbryt
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Lagrer...' : isEditing ? 'Lagre endringer' : 'Opprett produkt'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
