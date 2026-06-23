'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, UsersIcon } from 'lucide-react';
import { SignOutButton } from '@/components/sign-out-button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

type AppSidebarProps = {
    user?: {
        name?: string | null;
        email?: string | null;
    };
    isAdmin: boolean;
};

export function AppSidebar({ user, isAdmin }: AppSidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { title: 'Hjem', href: '/', icon: HomeIcon },
        ...(isAdmin ? [{ title: 'Admin', href: '/admin', icon: UsersIcon }] : []),
    ];

    return (
        <Sidebar collapsible="none" className="h-svh shrink-0">
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <p className="text-sm font-semibold">Targeter Webshop</p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigasjon</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-4">
                <div className="flex flex-col gap-3">
                    {user ? (
                        <div className="min-w-0 px-2">
                            {user.name ? <p className="truncate text-sm font-medium">{user.name}</p> : null}
                            {user.email ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
                        </div>
                    ) : null}
                    <SignOutButton className="w-full" />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
