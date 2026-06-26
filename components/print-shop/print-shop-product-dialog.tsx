'use client';

import { useEffect, useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import {
    createPrintShopProduct,
    updatePrintShopProduct,
    type PrintShopProductSizeInput,
} from '@/lib/actions/print-shop-products';
import type { PrintShopProduct } from '@/lib/queries/print-shop-products';
import { getStockForShop } from '@/lib/product-stock';
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

type PrintShopProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    product?: PrintShopProduct | null;
    printShopId: string;
};

type SizeRow = PrintShopProductSizeInput & { key: string };

function createSizeRow(printShopId: string, size?: PrintShopProduct['sizes'][number]): SizeRow {
    return {
        key: size?.id ?? crypto.randomUUID(),
        id: size?.id,
        size: size?.size ?? '',
        stock: size ? getStockForShop(size.stocks, printShopId) : 0,
    };
}

export function PrintShopProductDialog({
    open,
    onOpenChange,
    onSuccess,
    product,
    printShopId,
}: PrintShopProductDialogProps) {
    const isEditing = Boolean(product);
    const canEditDetails = product?.canEditDetails ?? true;
    const [name, setName] = useState(product?.name ?? '');
    const [description, setDescription] = useState(product?.description ?? '');
    const [sizes, setSizes] = useState<SizeRow[]>(
        product?.sizes.length
            ? product.sizes.map((size) => createSizeRow(printShopId, size))
            : [createSizeRow(printShopId)],
    );
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function resetForm() {
        setName(product?.name ?? '');
        setDescription(product?.description ?? '');
        setSizes(
            product?.sizes.length
                ? product.sizes.map((size) => createSizeRow(printShopId, size))
                : [createSizeRow(printShopId)],
        );
        setError(null);
    }

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, product, printShopId]);

    function updateSizeRow(key: string, patch: Partial<SizeRow>) {
        setSizes((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    }

    function addSizeRow() {
        setSizes((current) => [...current, createSizeRow(printShopId)]);
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
            sizes: sizes.map(({ id, size, stock }) => ({
                id,
                size,
                stock: Number(stock) || 0,
            })),
        };

        const result = product
            ? await updatePrintShopProduct(product.id, payload)
            : await createPrintShopProduct(payload);

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
                            ? canEditDetails
                                ? 'Oppdater produktinformasjon og ditt lager.'
                                : 'Oppdater lageret ditt. Produktinformasjon deles med andre trykkerier.'
                            : 'Legg til et nytt produkt med størrelser og ditt lager.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="print-shop-product-name">Navn</Label>
                        <Input
                            id="print-shop-product-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            readOnly={isEditing && !canEditDetails}
                            disabled={isEditing && !canEditDetails}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="print-shop-product-description">Beskrivelse</Label>
                        <Textarea
                            id="print-shop-product-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={3}
                            readOnly={isEditing && !canEditDetails}
                            disabled={isEditing && !canEditDetails}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Størrelser og lager</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addSizeRow}>
                                <PlusIcon data-icon="inline-start" />
                                Størrelse
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {sizes.map((row) => (
                                <div key={row.key} className="rounded-lg border p-3">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs text-muted-foreground">Størrelse</Label>
                                            <Input
                                                value={row.size}
                                                onChange={(event) =>
                                                    updateSizeRow(row.key, { size: event.target.value })
                                                }
                                                placeholder="M"
                                                required
                                                readOnly={isEditing && !canEditDetails && Boolean(row.id)}
                                                disabled={isEditing && !canEditDetails && Boolean(row.id)}
                                            />
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <Label className="text-xs text-muted-foreground">Lager</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={row.stock}
                                                onChange={(event) =>
                                                    updateSizeRow(row.key, {
                                                        stock: Math.max(0, Number(event.target.value)),
                                                    })
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
                                            disabled={sizes.length <= 1}
                                        >
                                            <MinusIcon />
                                        </Button>
                                    </div>
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
