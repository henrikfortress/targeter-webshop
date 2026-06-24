'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { CartProvider } from '@/components/cart/cart-provider';
import { OrderSheet } from '@/components/order/order-sheet';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { PrintShopRecord } from '@/lib/queries/print-shops';

type AppShellProps = {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
    };
    isAdmin: boolean;
    isPrintShop: boolean;
    printShops: PrintShopRecord[];
};

export function AppShell({ children, user, isAdmin, isPrintShop, printShops }: AppShellProps) {
    return (
        <TooltipProvider>
            <CartProvider>
                <SidebarProvider>
                    <AppSidebar user={user} isAdmin={isAdmin} isPrintShop={isPrintShop} />
                    <SidebarInset>
                        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
                    </SidebarInset>
                    {!isPrintShop ? <OrderSheet printShops={printShops} /> : null}
                </SidebarProvider>
            </CartProvider>
        </TooltipProvider>
    );
}
