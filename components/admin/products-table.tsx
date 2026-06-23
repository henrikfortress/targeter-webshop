'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { DeleteProductDialog } from '@/components/admin/delete-product-dialog';
import { ProductDialog } from '@/components/admin/product-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PrintShopRecord } from '@/lib/queries/print-shops';
import type { ProductWithSizes } from '@/lib/queries/products';
import { getTotalStock } from '@/lib/product-stock';

type ProductsTableProps = {
    products: ProductWithSizes[];
    printShops: PrintShopRecord[];
};

export function ProductsTable({ products: initialProducts, printShops }: ProductsTableProps) {
    const router = useRouter();
    const [products, setProducts] = useState(initialProducts);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithSizes | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<ProductWithSizes | null>(null);

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    function reloadProducts() {
        router.refresh();
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{products.length} produkter totalt</p>
                    <Button onClick={() => setCreateOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Nytt produkt
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Navn</TableHead>
                            <TableHead>Beskrivelse</TableHead>
                            <TableHead>Størrelser</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">
                                <span className="sr-only">Handlinger</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-muted-foreground">
                                    Ingen produkter ennå.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">{product.description || '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {product.sizes.map((size) => (
                                                <Badge key={size.id} variant="outline">
                                                    {size.size}: {getTotalStock(size.stocks)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {product.active ? (
                                            <Badge variant="outline">Aktiv</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inaktiv</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setEditingProduct(product)}
                                                aria-label={`Rediger ${product.name}`}
                                            >
                                                <PencilIcon />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setDeletingProduct(product)}
                                                aria-label={`Slett ${product.name}`}
                                            >
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ProductDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={reloadProducts}
                printShops={printShops}
            />
            <ProductDialog
                product={editingProduct}
                open={editingProduct !== null}
                onOpenChange={(open) => {
                    if (!open) setEditingProduct(null);
                }}
                onSuccess={reloadProducts}
                printShops={printShops}
            />
            <DeleteProductDialog
                product={deletingProduct}
                open={deletingProduct !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingProduct(null);
                }}
                onSuccess={reloadProducts}
            />
        </>
    );
}
