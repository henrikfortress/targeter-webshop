import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) throw Error('Missing databae sconnection string');

export const db = drizzle(process.env.DATABASE_URL);
