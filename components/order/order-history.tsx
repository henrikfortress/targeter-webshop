import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { OrderWithItems } from '@/lib/queries/orders';
import {
    getFulfillmentStatusLabel,
    getFulfillmentStatusVariant,
    type FulfillmentStatus,
} from '@/lib/order-fulfillment/status';

type OrderHistoryProps = {
    orders: OrderWithItems[];
};

function formatOrderDate(date: Date) {
    return new Date(date).toLocaleString('nb-NO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function getTotalQuantity(items: OrderWithItems['items']) {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}

function FulfillmentStatusBadge({ status }: { status: FulfillmentStatus }) {
    return <Badge variant={getFulfillmentStatusVariant(status)}>{getFulfillmentStatusLabel(status)}</Badge>;
}

function getOverallOrderStatus(fulfillments: OrderWithItems['fulfillments']): FulfillmentStatus {
    if (fulfillments.length === 0) {
        return 'pending';
    }

    if (fulfillments.every((entry) => entry.status === 'delivered')) {
        return 'delivered';
    }

    if (fulfillments.some((entry) => entry.status === 'cancelled')) {
        return 'cancelled';
    }

    if (fulfillments.every((entry) => entry.status === 'sent' || entry.status === 'pending')) {
        return 'sent';
    }

    if (fulfillments.some((entry) => entry.status === 'shipped')) {
        return 'shipped';
    }

    if (fulfillments.some((entry) => entry.status === 'in_production')) {
        return 'in_production';
    }

    if (fulfillments.some((entry) => entry.status === 'confirmed')) {
        return 'confirmed';
    }

    return fulfillments[0]?.status ?? 'pending';
}

export function OrderHistory({ orders }: OrderHistoryProps) {
    if (orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Bestillinger</CardTitle>
                    <CardDescription>Du har ikke sendt inn noen bestillinger ennå.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Gå til forsiden for å legge produkter i bestillingen din.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {orders.length} bestilling{orders.length === 1 ? '' : 'er'} totalt
            </p>
            {orders.map((order) => {
                const totalQuantity = getTotalQuantity(order.items);
                const overallStatus = getOverallOrderStatus(order.fulfillments);

                return (
                    <Card key={order.id}>
                        <CardHeader className="border-b bg-muted/40">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle>{formatOrderDate(order.createdAt)}</CardTitle>
                                    <CardDescription className="font-mono text-xs">
                                        Referanse: {order.id}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <FulfillmentStatusBadge status={overallStatus} />
                                    <Badge variant="outline">
                                        {totalQuantity} vare{totalQuantity === 1 ? '' : 'r'}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {order.fulfillments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Sporing per trykkeri</p>
                                    <div className="flex flex-wrap gap-2">
                                        {order.fulfillments.map((fulfillment) => (
                                            <div
                                                key={fulfillment.id}
                                                className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                                            >
                                                <span className="font-medium">{fulfillment.printShopName}</span>
                                                <FulfillmentStatusBadge status={fulfillment.status} />
                                                <span className="text-xs text-muted-foreground">
                                                    Oppdatert {formatOrderDate(fulfillment.updatedAt)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produkt</TableHead>
                                        <TableHead>Størrelse</TableHead>
                                        <TableHead>Trykkeri</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Antall</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>{item.size}</TableCell>
                                            <TableCell>{item.printShopName}</TableCell>
                                            <TableCell>
                                                <FulfillmentStatusBadge status={item.fulfillmentStatus} />
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
