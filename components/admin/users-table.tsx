'use client';

import { useEffect, useState } from 'react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog';
import { EditUserDialog } from '@/components/admin/edit-user-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { PrintShopRecord } from '@/lib/queries/print-shops';

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    banned?: boolean | null;
    createdAt: Date | string;
};

export function UsersTable({ printShops }: { printShops: PrintShopRecord[] }) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

    async function fetchUsers() {
        const { data, error: listError } = await authClient.admin.listUsers({
            query: {
                limit: 100,
                offset: 0,
                sortBy: 'createdAt',
                sortDirection: 'desc',
            },
        });

        if (listError) {
            setError(listError.message ?? 'Kunne ikke laste brukere');
            setIsLoading(false);
            return;
        }

        setUsers(data?.users ?? []);
        setTotal(data?.total ?? 0);
        setIsLoading(false);
    }

    async function reloadUsers() {
        setIsLoading(true);
        setError(null);
        await fetchUsers();
    }

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const { data, error: listError } = await authClient.admin.listUsers({
                query: {
                    limit: 100,
                    offset: 0,
                    sortBy: 'createdAt',
                    sortDirection: 'desc',
                },
            });

            if (cancelled) return;

            if (listError) {
                setError(listError.message ?? 'Kunne ikke laste brukere');
                setIsLoading(false);
                return;
            }

            setUsers(data?.users ?? []);
            setTotal(data?.total ?? 0);
            setIsLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Laster brukere...</p>;
    }

    if (error) {
        return <p className="text-sm text-destructive">{error}</p>;
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{total} brukere totalt</p>
                    <Button onClick={() => setCreateOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Ny bruker
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Navn</TableHead>
                            <TableHead>E-post</TableHead>
                            <TableHead>Rolle</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Opprettet</TableHead>
                            <TableHead className="w-[100px]">
                                <span className="sr-only">Handlinger</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{user.role ?? 'user'}</Badge>
                                </TableCell>
                                <TableCell>
                                    {user.banned ? (
                                        <Badge variant="destructive">Utestengt</Badge>
                                    ) : (
                                        <Badge variant="outline">Aktiv</Badge>
                                    )}
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString('nb-NO')}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setEditingUser(user)}
                                            aria-label={`Rediger ${user.name}`}
                                        >
                                            <PencilIcon />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setDeletingUser(user)}
                                            aria-label={`Slett ${user.name}`}
                                        >
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <CreateUserDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={reloadUsers}
                printShops={printShops}
            />
            <EditUserDialog
                user={editingUser}
                open={editingUser !== null}
                onOpenChange={(open) => {
                    if (!open) setEditingUser(null);
                }}
                onSuccess={reloadUsers}
                printShops={printShops}
            />
            <DeleteUserDialog
                user={deletingUser}
                open={deletingUser !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingUser(null);
                }}
                onSuccess={reloadUsers}
            />
        </>
    );
}
