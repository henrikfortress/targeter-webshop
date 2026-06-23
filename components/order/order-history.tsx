import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { OrderWithItems } from '@/lib/queries/orders';

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
                                <Badge variant="outline">
                                    {totalQuantity} vare{totalQuantity === 1 ? '' : 'r'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produkt</TableHead>
                                        <TableHead>Størrelse</TableHead>
                                        <TableHead>Trykkeri</TableHead>
                                        <TableHead className="text-right">Antall</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>{item.size}</TableCell>
                                            <TableCell>{item.printShopName}</TableCell>
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
