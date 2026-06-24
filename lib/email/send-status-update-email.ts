import { getResendClient, resendFromEmail } from '@/lib/email/resend';
import { buildFulfillmentRef, getFulfillmentStatusLabel, type FulfillmentStatus } from '@/lib/order-fulfillment/status';

type StatusUpdateEmailItem = {
    productName: string;
    size: string;
    quantity: number;
};

type SendStatusUpdateEmailInput = {
    fulfillmentId: string;
    orderId: string;
    previousStatus: FulfillmentStatus;
    newStatus: FulfillmentStatus;
    printShopName: string;
    printShopEmail: string;
    userEmail: string;
    userName: string;
    items: StatusUpdateEmailItem[];
    updatedAt: Date;
};

function formatDate(date: Date) {
    return date.toLocaleString('nb-NO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function buildStatusUpdateEmailContent(input: SendStatusUpdateEmailInput) {
    const fulfillmentRef = buildFulfillmentRef(input.fulfillmentId);
    const previousLabel = getFulfillmentStatusLabel(input.previousStatus);
    const newLabel = getFulfillmentStatusLabel(input.newStatus);

    const itemRows = input.items
        .map(
            (item) =>
                `<tr><td style="padding:8px;border:1px solid #e5e7eb;">${item.productName}</td><td style="padding:8px;border:1px solid #e5e7eb;">${item.size}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${item.quantity}</td></tr>`,
        )
        .join('');

    const itemLines = input.items.map((item) => `- ${item.productName} (${item.size}) × ${item.quantity}`).join('\n');

    const subject = `[Targeter] Status oppdatert: ${newLabel} — ${fulfillmentRef}`;

    const html = `
        <div style="font-family:sans-serif;color:#111827;max-width:640px;">
            <h1 style="font-size:20px;margin-bottom:8px;">Bestillingsstatus oppdatert</h1>
            <p style="margin:0 0 16px;color:#4b5563;">Status for bestilling hos ${input.printShopName} er endret ${formatDate(input.updatedAt)}.</p>
            <p style="margin:0 0 8px;"><strong>Referanse:</strong> <code>${fulfillmentRef}</code></p>
            <p style="margin:0 0 8px;"><strong>Ordre-ID:</strong> ${input.orderId}</p>
            <p style="margin:0 0 8px;"><strong>Kunde:</strong> ${input.userName} (${input.userEmail})</p>
            <p style="margin:0 0 16px;"><strong>Status:</strong> ${previousLabel} → <strong>${newLabel}</strong></p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <thead>
                    <tr>
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;background:#f9fafb;">Produkt</th>
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;background:#f9fafb;">Størrelse</th>
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;background:#f9fafb;">Antall</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
        </div>
    `.trim();

    const text = [
        'Bestillingsstatus oppdatert',
        '',
        `Referanse: ${fulfillmentRef}`,
        `Ordre-ID: ${input.orderId}`,
        `Trykkeri: ${input.printShopName}`,
        `Kunde: ${input.userName} (${input.userEmail})`,
        `Status: ${previousLabel} → ${newLabel}`,
        `Oppdatert: ${formatDate(input.updatedAt)}`,
        '',
        'Varer:',
        itemLines,
    ].join('\n');

    return { subject, html, text };
}

export async function sendStatusUpdateEmail(input: SendStatusUpdateEmailInput) {
    const resend = getResendClient();

    if (!resend) {
        console.warn('[STATUS UPDATE EMAIL] RESEND_API_KEY is not configured, skipping email send');
        return { skipped: true as const };
    }

    if (!resendFromEmail) {
        console.warn('[STATUS UPDATE EMAIL] RESEND_FROM is not configured, skipping email send');
        return { skipped: true as const };
    }

    const { subject, html, text } = buildStatusUpdateEmailContent(input);

    const { data, error } = await resend.emails.send({
        from: resendFromEmail,
        to: [input.userEmail],
        cc: [input.printShopEmail],
        subject,
        html,
        text,
    });

    if (error) {
        console.error('[STATUS UPDATE EMAIL] Failed to send', error);
        return { error: error.message };
    }

    return { success: true as const, emailId: data?.id };
}
