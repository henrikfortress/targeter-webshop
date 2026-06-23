'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PackageIcon, PrinterIcon, UsersIcon } from 'lucide-react';
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

const adminLinks = [
    { title: 'Brukere', href: '/admin/users', icon: UsersIcon },
    { title: 'Produkter', href: '/admin/products', icon: PackageIcon },
    { title: 'Trykkeri', href: '/admin/fulfillment', icon: PrinterIcon },
] as const;

export function AppSidebar({ user, isAdmin }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="none" className="h-svh shrink-0">
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <Link href="/" className="block w-fit">
                    <img src="/targeter.svg" alt="Targeter" className="h-6 w-auto" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Hjem">
                                    <Link href="/">
                                        <HomeIcon />
                                        <span>Hjem</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {isAdmin ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Admin</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {adminLinks.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href}
                                            tooltip={item.title}
                                        >
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
                ) : null}
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
