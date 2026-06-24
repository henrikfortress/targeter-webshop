import 'dotenv/config';

import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { printShop, user } from '@/lib/db/schema';

function parseArgs() {
    const args = process.argv.slice(2);
    const parsed: Record<string, string> = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg.startsWith('--')) continue;

        const key = arg.slice(2);
        const value = args[i + 1];

        if (!value || value.startsWith('--')) {
            throw new Error(`Missing value for --${key}`);
        }

        parsed[key] = value;
        i++;
    }

    return parsed;
}

async function main() {
    const { email, password, name, role, printShopId } = parseArgs();

    if (!email || !password) {
        console.error(
            'Usage: bun run create-user -- --email <email> --password <password> [--name <name>] [--role <role>] [--print-shop-id <id>]',
        );
        process.exit(1);
    }

    let userRole: 'user' | 'admin' | 'print_shop' | undefined;
    if (role) {
        if (role !== 'user' && role !== 'admin' && role !== 'print_shop') {
            throw new Error(`Invalid role "${role}". Must be "user", "admin", or "print_shop".`);
        }
        userRole = role;
    }

    if (userRole === 'print_shop' && !printShopId) {
        throw new Error('print_shop role requires --print-shop-id');
    }

    if (printShopId) {
        const shop = await db.query.printShop.findFirst({
            where: eq(printShop.id, printShopId),
        });

        if (!shop) {
            throw new Error(`Print shop "${printShopId}" not found`);
        }
    }

    const result = await auth.api.createUser({
        body: {
            email,
            password,
            name: name ?? email.split('@')[0] ?? email,
            ...(userRole === 'print_shop' ? {} : userRole ? { role: userRole } : {}),
        },
    });

    if (userRole === 'print_shop' && printShopId) {
        await db.update(user).set({ role: 'print_shop', printShopId }).where(eq(user.id, result.user.id));
    }

    console.log(`Created user ${result.user.email} (${result.user.id})`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
