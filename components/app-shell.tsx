'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

type AppShellProps = {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
    };
    isAdmin: boolean;
};

export function AppShell({ children, user, isAdmin }: AppShellProps) {
    return (
        <TooltipProvider>
            <SidebarProvider className="min-h-svh h-svh">
                <AppSidebar user={user} isAdmin={isAdmin} />
                <SidebarInset>
                    <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
