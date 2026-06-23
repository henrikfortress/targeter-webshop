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
    printShops: PrintShopRecord[];
};

export function AppShell({ children, user, isAdmin, printShops }: AppShellProps) {
    return (
        <TooltipProvider>
            <CartProvider>
                <SidebarProvider className="min-h-svh h-svh">
                    <AppSidebar user={user} isAdmin={isAdmin} />
                    <SidebarInset>
                        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
                    </SidebarInset>
                    <OrderSheet printShops={printShops} />
                </SidebarProvider>
            </CartProvider>
        </TooltipProvider>
    );
}
