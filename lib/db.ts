import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

if (!process.env.DATABASE_URL) throw Error('Missing databae sconnection string');

export const db = drizzle(process.env.DATABASE_URL, { schema });
