import 'dotenv/config';

import { auth } from '@/lib/auth';

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
    const { email, password, name, role } = parseArgs();

    if (!email || !password) {
        console.error(
            'Usage: bun run create-user -- --email <email> --password <password> [--name <name>] [--role <role>]',
        );
        process.exit(1);
    }

    let userRole: 'user' | 'admin' | undefined;
    if (role) {
        if (role !== 'user' && role !== 'admin') {
            throw new Error(`Invalid role "${role}". Must be "user" or "admin".`);
        }
        userRole = role;
    }

    const result = await auth.api.createUser({
        body: {
            email,
            password,
            name: name ?? email.split('@')[0] ?? email,
            ...(userRole ? { role: userRole } : {}),
        },
    });

    console.log(`Created user ${result.user.email} (${result.user.id})`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
