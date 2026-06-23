'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { DeletePrintShopDialog } from '@/components/admin/delete-print-shop-dialog';
import { PrintShopDialog } from '@/components/admin/print-shop-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PrintShopRecord } from '@/lib/queries/print-shops';

type PrintShopsTableProps = {
    printShops: PrintShopRecord[];
};

export function PrintShopsTable({ printShops: initialPrintShops }: PrintShopsTableProps) {
    const router = useRouter();
    const [printShops, setPrintShops] = useState(initialPrintShops);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<PrintShopRecord | null>(null);
    const [deletingShop, setDeletingShop] = useState<PrintShopRecord | null>(null);

    useEffect(() => {
        setPrintShops(initialPrintShops);
    }, [initialPrintShops]);

    function reloadPrintShops() {
        router.refresh();
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{printShops.length} trykkeri totalt</p>
                    <Button onClick={() => setCreateOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Nytt trykkeri
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Navn</TableHead>
                            <TableHead>E-post</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Opprettet</TableHead>
                            <TableHead className="w-[100px]">
                                <span className="sr-only">Handlinger</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {printShops.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-muted-foreground">
                                    Ingen trykkeri registrert ennå.
                                </TableCell>
                            </TableRow>
                        ) : (
                            printShops.map((shop) => (
                                <TableRow key={shop.id}>
                                    <TableCell className="font-medium">{shop.name}</TableCell>
                                    <TableCell>{shop.email}</TableCell>
                                    <TableCell>
                                        {shop.active ? (
                                            <Badge variant="outline">Aktiv</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inaktiv</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(shop.createdAt).toLocaleDateString('nb-NO')}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setEditingShop(shop)}
                                                aria-label={`Rediger ${shop.name}`}
                                            >
                                                <PencilIcon />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setDeletingShop(shop)}
                                                aria-label={`Slett ${shop.name}`}
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

            <PrintShopDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={reloadPrintShops} />
            <PrintShopDialog
                printShop={editingShop}
                open={editingShop !== null}
                onOpenChange={(open) => {
                    if (!open) setEditingShop(null);
                }}
                onSuccess={reloadPrintShops}
            />
            <DeletePrintShopDialog
                printShop={deletingShop}
                open={deletingShop !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingShop(null);
                }}
                onSuccess={reloadPrintShops}
            />
        </>
    );
}
