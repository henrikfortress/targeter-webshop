'use client';

import { useEffect, useState } from 'react';
import { AlertCircleIcon, CheckIcon, ShoppingCartIcon } from 'lucide-react';
import { useCart } from '@/components/cart/cart-provider';
import type { PrintShopRecord } from '@/lib/queries/print-shops';
import type { ProductWithSizes } from '@/lib/queries/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProductCardProps = {
    product: ProductWithSizes;
    printShops: PrintShopRecord[];
};

export function ProductCard({ product, printShops }: ProductCardProps) {
    const { addItem } = useCart();
    const availableSizes = product.sizes.filter((size) => size.stock > 0);
    const [selectedSizeId, setSelectedSizeId] = useState(availableSizes[0]?.id ?? '');
    const [printShopId, setPrintShopId] = useState(printShops[0]?.id ?? '');
    const [quantity, setQuantity] = useState(1);
    const [feedback, setFeedback] = useState<'idle' | 'added' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (feedback === 'idle') return;

        const timeout = setTimeout(() => setFeedback('idle'), feedback === 'added' ? 2000 : 3000);
        return () => clearTimeout(timeout);
    }, [feedback]);

    const selectedSize = product.sizes.find((size) => size.id === selectedSizeId);
    const totalStock = product.sizes.reduce((sum, size) => sum + size.stock, 0);

    function handleAddToCart() {
        if (!selectedSize || selectedSize.stock <= 0) {
            setErrorMessage('Velg en størrelse med lager');
            setFeedback('error');
            return;
        }

        if (!printShopId) {
            setErrorMessage('Velg et trykkeri');
            setFeedback('error');
            return;
        }

        addItem({
            productId: product.id,
            productSizeId: selectedSize.id,
            productName: product.name,
            size: selectedSize.size,
            maxStock: selectedSize.stock,
            printShopId,
            quantity,
        });

        setFeedback('added');
        setQuantity(1);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle>{product.name}</CardTitle>
                        {product.description ? (
                            <CardDescription className="mt-1">{product.description}</CardDescription>
                        ) : null}
                    </div>
                    <Badge variant={totalStock > 0 ? 'outline' : 'destructive'}>
                        {totalStock > 0 ? `${totalStock} på lager` : 'Utsolgt'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                        <Badge key={size.id} variant={size.stock > 0 ? 'secondary' : 'outline'}>
                            {size.size}: {size.stock}
                        </Badge>
                    ))}
                </div>
                {availableSizes.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`size-${product.id}`}>Størrelse</Label>
                            <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
                                <SelectTrigger id={`size-${product.id}`}>
                                    <SelectValue placeholder="Velg størrelse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSizes.map((size) => (
                                        <SelectItem key={size.id} value={size.id}>
                                            {size.size} ({size.stock} igjen)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`quantity-${product.id}`}>Antall</Label>
                            <Input
                                id={`quantity-${product.id}`}
                                type="number"
                                min={1}
                                max={selectedSize?.stock ?? 1}
                                value={quantity}
                                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor={`print-shop-${product.id}`}>Trykkeri</Label>
                            {printShops.length > 0 ? (
                                <Select value={printShopId} onValueChange={setPrintShopId}>
                                    <SelectTrigger id={`print-shop-${product.id}`}>
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
                                <p className="text-sm text-muted-foreground">Ingen trykkeri tilgjengelig.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Produktet er midlertidig utsolgt.</p>
                )}
            </CardContent>
            {availableSizes.length > 0 && printShops.length > 0 ? (
                <CardFooter>
                    <Button
                        onClick={handleAddToCart}
                        variant={feedback === 'error' ? 'destructive' : feedback === 'added' ? 'secondary' : 'default'}
                        className="transition-all duration-300"
                    >
                        {feedback === 'added' ? (
                            <>
                                <CheckIcon
                                    data-icon="inline-start"
                                    className="animate-in zoom-in-50 fade-in duration-300"
                                />
                                <span className="animate-in fade-in slide-in-from-left-1 duration-300">
                                    Lagt til i bestilling
                                </span>
                            </>
                        ) : feedback === 'error' ? (
                            <>
                                <AlertCircleIcon
                                    data-icon="inline-start"
                                    className="animate-in zoom-in-50 fade-in duration-300"
                                />
                                <span className="animate-in fade-in slide-in-from-left-1 duration-300">
                                    {errorMessage}
                                </span>
                            </>
                        ) : (
                            <>
                                <ShoppingCartIcon data-icon="inline-start" />
                                Legg til i bestilling
                            </>
                        )}
                    </Button>
                </CardFooter>
            ) : null}
        </Card>
    );
}
