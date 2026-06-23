import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { OrderHistory } from '@/components/order/order-history';
import { auth } from '@/lib/auth';
import { getUserOrders } from '@/lib/queries/orders';

export default async function OrdersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/login');
    }

    const orders = await getUserOrders(session.user.id);

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold">Bestillingshistorikk</h1>
                <p className="text-sm text-muted-foreground">Oversikt over bestillinger du har sendt inn.</p>
            </div>
            <OrderHistory orders={orders} />
        </>
    );
}
