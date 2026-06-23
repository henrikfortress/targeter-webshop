import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { printShop } from '@/lib/db/schema';

export type PrintShopRecord = {
    id: string;
    name: string;
    email: string;
    active: boolean;
    createdAt: Date;
};

export async function getActivePrintShops(): Promise<PrintShopRecord[]> {
    return db.query.printShop.findMany({
        where: eq(printShop.active, true),
        orderBy: asc(printShop.name),
    });
}

export async function getAllPrintShops(): Promise<PrintShopRecord[]> {
    return db.query.printShop.findMany({
        orderBy: asc(printShop.name),
    });
}
