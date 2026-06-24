'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { updateFulfillmentStatus } from '@/lib/actions/fulfillment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    canUpdateFulfillmentStatus,
    getFulfillmentStatusActionLabel,
    getFulfillmentStatusLabel,
    getFulfillmentStatusVariant,
    getNextStatuses,
    type FulfillmentStatus,
} from '@/lib/order-fulfillment/status';
import type { PrintShopOrder } from '@/lib/queries/print-shop-orders';

type PrintShopOrdersTableProps = {
    orders: PrintShopOrder[];
};

function formatOrderDate(date: Date) {
    return new Date(date).toLocaleString('nb-NO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function FulfillmentStatusBadge({ status }: { status: FulfillmentStatus }) {
    return <Badge variant={getFulfillmentStatusVariant(status)}>{getFulfillmentStatusLabel(status)}</Badge>;
}

function statusButtonVariant(status: FulfillmentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'cancelled') return 'destructive';
    if (status === 'delivered') return 'default';
    return 'secondary';
}

function StatusUpdater({ order }: { order: PrintShopOrder }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const nextStatuses = getNextStatuses(order.status);
    const canUpdate = canUpdateFulfillmentStatus(order.status) && nextStatuses.length > 0;

    function handleStatusChange(status: FulfillmentStatus) {
        setError(null);
        startTransition(async () => {
            const result = await updateFulfillmentStatus({
                fulfillmentId: order.fulfillmentId,
                status,
            });

            if ('error' in result && result.error) {
                setError(result.error);
                return;
            }

            router.refresh();
        });
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <FulfillmentStatusBadge status={order.status} />
            {canUpdate ? (
                <div className="flex flex-wrap justify-end gap-2">
                    {nextStatuses.map((status) => (
                        <Button
                            key={status}
                            type="button"
                            size="sm"
                            variant={statusButtonVariant(status)}
                            disabled={isPending}
                            onClick={() => handleStatusChange(status)}
                        >
                            {getFulfillmentStatusActionLabel(status)}
                        </Button>
                    ))}
                </div>
            ) : null}
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
    );
}

export function PrintShopOrdersTable({ orders }: PrintShopOrdersTableProps) {
    if (orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Bestillinger</CardTitle>
                    <CardDescription>Ingen bestillinger mottatt ennå.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {orders.length} bestilling{orders.length === 1 ? '' : 'er'} totalt
            </p>
            {orders.map((order) => (
                <Card key={order.fulfillmentId}>
                    <CardHeader className="border-b bg-muted/40">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle>{formatOrderDate(order.createdAt)}</CardTitle>
                                <CardDescription className="font-mono text-xs">
                                    Referanse: {order.orderId}
                                </CardDescription>
                                <CardDescription>
                                    {order.customerName} ({order.customerEmail})
                                </CardDescription>
                            </div>
                            <StatusUpdater order={order} />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produkt</TableHead>
                                    <TableHead>Størrelse</TableHead>
                                    <TableHead className="text-right">Antall</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell>{item.size}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Sist oppdatert {formatOrderDate(order.updatedAt)}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
