'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { orderFulfillment } from '@/lib/db/schema';
import { parseFulfillmentRef, parseStatusKeyword, type FulfillmentStatus } from '@/lib/order-fulfillment/status';

function extractEmailAddress(from: string): string {
    const match = from.match(/<([^>]+)>/);
    return (match?.[1] ?? from).trim().toLowerCase();
}

export async function updateFulfillmentFromReply(input: {
    subject: string;
    text?: string | null;
    html?: string | null;
    from: string;
}) {
    const combinedText = [input.subject, input.text, input.html].filter(Boolean).join('\n');
    const fulfillmentId = parseFulfillmentRef(combinedText);

    if (!fulfillmentId) {
        return { error: 'Ingen gyldig bestillingsreferanse funnet' };
    }

    const status = parseStatusKeyword(combinedText);

    if (!status) {
        return { error: 'Ingen gyldig statusnøkkelord funnet' };
    }

    const fulfillment = await db.query.orderFulfillment.findFirst({
        where: eq(orderFulfillment.id, fulfillmentId),
        with: {
            printShop: true,
        },
    });

    if (!fulfillment) {
        return { error: 'Bestillingen ble ikke funnet' };
    }

    const senderEmail = extractEmailAddress(input.from);
    const printShopEmail = fulfillment.printShop.email.toLowerCase();

    if (senderEmail !== printShopEmail) {
        return { error: 'Avsender matcher ikke trykkeriets e-postadresse' };
    }

    await db.update(orderFulfillment).set({ status }).where(eq(orderFulfillment.id, fulfillmentId));

    revalidatePath('/orders');

    return { success: true, fulfillmentId, status: status as FulfillmentStatus };
}
