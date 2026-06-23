'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircleIcon, CheckIcon, ShoppingCartIcon } from 'lucide-react';
import { useCart } from '@/components/cart/cart-provider';
import type { PrintShopRecord } from '@/lib/queries/print-shops';
import { getStockForShop } from '@/lib/product-stock';
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
    const [printShopId, setPrintShopId] = useState(printShops[0]?.id ?? '');

    const availableSizes = useMemo(
        () => product.sizes.filter((size) => getStockForShop(size.stocks, printShopId) > 0),
        [product.sizes, printShopId],
    );

    const [selectedSizeId, setSelectedSizeId] = useState(availableSizes[0]?.id ?? '');
    const [quantity, setQuantity] = useState(1);
    const [feedback, setFeedback] = useState<'idle' | 'added' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (availableSizes.some((size) => size.id === selectedSizeId)) return;
        setSelectedSizeId(availableSizes[0]?.id ?? '');
        setQuantity(1);
    }, [availableSizes, selectedSizeId]);

    useEffect(() => {
        if (feedback === 'idle') return;

        const timeout = setTimeout(() => setFeedback('idle'), feedback === 'added' ? 2000 : 3000);
        return () => clearTimeout(timeout);
    }, [feedback]);

    const selectedSize = product.sizes.find((size) => size.id === selectedSizeId);
    const selectedStock = selectedSize ? getStockForShop(selectedSize.stocks, printShopId) : 0;
    const totalStock = product.sizes.reduce((sum, size) => sum + getStockForShop(size.stocks, printShopId), 0);
    const selectedShop = printShops.find((shop) => shop.id === printShopId);

    function handleAddToCart() {
        if (!selectedSize || selectedStock <= 0) {
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
            maxStock: selectedStock,
            stocksByShop: Object.fromEntries(selectedSize.stocks.map((entry) => [entry.printShopId, entry.stock])),
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
                        {selectedShop
                            ? totalStock > 0
                                ? `${totalStock} på lager hos ${selectedShop.name}`
                                : `Utsolgt hos ${selectedShop.name}`
                            : totalStock > 0
                              ? `${totalStock} på lager`
                              : 'Utsolgt'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {printShops.length > 0 ? (
                    <div className="space-y-2">
                        <Label htmlFor={`print-shop-${product.id}`}>Trykkeri</Label>
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
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Ingen trykkeri tilgjengelig.</p>
                )}
                <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                        const stock = getStockForShop(size.stocks, printShopId);

                        return (
                            <Badge key={size.id} variant={stock > 0 ? 'secondary' : 'outline'}>
                                {size.size}: {stock}
                            </Badge>
                        );
                    })}
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
                                            {size.size} ({getStockForShop(size.stocks, printShopId)} igjen)
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
                                max={selectedStock || 1}
                                value={quantity}
                                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {selectedShop
                            ? `Produktet er midlertidig utsolgt hos ${selectedShop.name}.`
                            : 'Produktet er midlertidig utsolgt.'}
                    </p>
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
