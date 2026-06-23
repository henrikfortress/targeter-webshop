'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import { useCart } from '@/components/cart/cart-provider';
import { submitOrder } from '@/lib/actions/orders';
import type { PrintShopRecord } from '@/lib/queries/print-shops';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type OrderSummaryProps = {
    printShops: PrintShopRecord[];
    onSuccess: (orderId: string) => void;
};

export function OrderSummary({ printShops, onSuccess }: OrderSummaryProps) {
    const router = useRouter();
    const { items, updateQuantity, updatePrintShop, removeItem, clearCart } = useCart();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasMissingPrintShop = items.some((item) => !item.printShopId);
    const canSubmit = items.length > 0 && printShops.length > 0 && !hasMissingPrintShop;

    async function handleSubmit() {
        setError(null);
        setIsSubmitting(true);

        const result = await submitOrder({ items });

        setIsSubmitting(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (!result.orderId) {
            setError('Noe gikk galt ved innsending');
            return;
        }

        clearCart();
        router.refresh();
        onSuccess(result.orderId);
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-6 text-center">
                <p className="font-medium">Bestillingen er tom</p>
                <p className="text-sm text-muted-foreground">Legg til produkter for å starte en bestilling.</p>
            </div>
        );
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 pb-4">
                <div>
                    {items.map((item, index) => (
                        <div key={item.productSizeId}>
                            {index > 0 ? <Separator /> : null}
                            <div className="space-y-3 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-sm text-muted-foreground">Størrelse: {item.size}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => removeItem(item.productSizeId)}
                                        aria-label={`Fjern ${item.productName}`}
                                    >
                                        <Trash2Icon />
                                    </Button>
                                </div>
                                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor={`qty-${item.productSizeId}`}>Antall</Label>
                                        <Input
                                            id={`qty-${item.productSizeId}`}
                                            type="number"
                                            min={1}
                                            max={item.maxStock}
                                            value={item.quantity}
                                            onChange={(event) =>
                                                updateQuantity(item.productSizeId, Number(event.target.value) || 1)
                                            }
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground">Maks {item.maxStock} på lager</p>
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor={`print-shop-${item.productSizeId}`}>Trykkeri</Label>
                                        {printShops.length > 0 ? (
                                            <Select
                                                value={item.printShopId}
                                                onValueChange={(value) => updatePrintShop(item.productSizeId, value)}
                                            >
                                                <SelectTrigger
                                                    id={`print-shop-${item.productSizeId}`}
                                                    className="w-full max-w-full"
                                                >
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
                                        ) : (
                                            <p className="text-sm text-destructive">Ingen trykkeri tilgjengelig</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3 border-t p-6">
                {printShops.length === 0 ? (
                    <p className="text-sm text-destructive">Ingen trykkeri er tilgjengelig. Kontakt administrator.</p>
                ) : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <p className="text-right text-sm text-muted-foreground">{totalItems} varer totalt</p>
                <Button className="w-full" disabled={isSubmitting || !canSubmit} onClick={handleSubmit}>
                    {isSubmitting ? 'Sender...' : 'Send bestilling'}
                </Button>
            </div>
        </div>
    );
}
