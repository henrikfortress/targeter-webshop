import { buildFulfillmentRef } from '@/lib/order-fulfillment/status';
import { getResendClient, resendFromEmail, resendReplyToEmail } from '@/lib/email/resend';

type FulfillmentEmailItem = {
    productName: string;
    size: string;
    quantity: number;
};

type SendFulfillmentEmailInput = {
    fulfillmentId: string;
    orderId: string;
    printShopName: string;
    printShopEmail: string;
    userEmail: string;
    userName: string;
    items: FulfillmentEmailItem[];
    submittedAt: Date;
};

function formatDate(date: Date) {
    return date.toLocaleString('nb-NO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function buildFulfillmentEmailContent(input: SendFulfillmentEmailInput) {
    const fulfillmentRef = buildFulfillmentRef(input.fulfillmentId);
    const itemRows = input.items
        .map(
            (item) =>
                `<tr><td style="padding:8px;border:1px solid #e5e7eb;">${item.productName}</td><td style="padding:8px;border:1px solid #e5e7eb;">${item.size}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${item.quantity}</td></tr>`,
        )
        .join('');

    const itemLines = input.items.map((item) => `- ${item.productName} (${item.size}) × ${item.quantity}`).join('\n');

    const subject = `[Targeter] Ny bestilling ${fulfillmentRef}`;

    const html = `
        <div style="font-family:sans-serif;color:#111827;max-width:640px;">
            <h1 style="font-size:20px;margin-bottom:8px;">Ny bestilling til ${input.printShopName}</h1>
            <p style="margin:0 0 16px;color:#4b5563;">Bestilling mottatt ${formatDate(input.submittedAt)} fra ${input.userName}.</p>
            <p style="margin:0 0 8px;"><strong>Referanse:</strong> <code>${fulfillmentRef}</code></p>
            <p style="margin:0 0 16px;"><strong>Ordre-ID:</strong> ${input.orderId}</p>
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
            <h2 style="font-size:16px;margin-bottom:8px;">Oppdater status</h2>
            <p style="margin:0 0 8px;color:#4b5563;">Svar på denne e-posten med ett av følgende nøkkelord for å oppdatere status i webshoppen:</p>
            <ul style="margin:0 0 16px;padding-left:20px;color:#374151;">
                <li><strong>CONFIRMED</strong> – bestillingen er mottatt og bekreftet</li>
                <li><strong>IN_PRODUCTION</strong> – bestillingen er i produksjon</li>
                <li><strong>SHIPPED</strong> – bestillingen er sendt</li>
                <li><strong>DELIVERED</strong> – bestillingen er levert</li>
                <li><strong>CANCELLED</strong> – bestillingen er kansellert</li>
            </ul>
            <p style="margin:0;color:#6b7280;font-size:14px;">Behold referansen <code>${fulfillmentRef}</code> i emnefeltet når du svarer.</p>
        </div>
    `.trim();

    const text = [
        `Ny bestilling til ${input.printShopName}`,
        '',
        `Referanse: ${fulfillmentRef}`,
        `Ordre-ID: ${input.orderId}`,
        `Bestilt av: ${input.userName} (${input.userEmail})`,
        `Mottatt: ${formatDate(input.submittedAt)}`,
        '',
        'Varer:',
        itemLines,
        '',
        'Svar på denne e-posten med ett av følgende nøkkelord:',
        'CONFIRMED, IN_PRODUCTION, SHIPPED, DELIVERED, CANCELLED',
        '',
        `Behold referansen ${fulfillmentRef} i emnefeltet.`,
    ].join('\n');

    return { subject, html, text, fulfillmentRef };
}

export async function sendFulfillmentEmail(input: SendFulfillmentEmailInput) {
    const resend = getResendClient();

    if (!resend) {
        console.warn('[FULFILLMENT EMAIL] RESEND_API_KEY is not configured, skipping email send');
        return { skipped: true as const };
    }

    if (!resendFromEmail || !resendReplyToEmail) {
        console.warn('[FULFILLMENT EMAIL] RESEND_FROM or RESEND_REPLY_TO is not configured, skipping email send');
        return { skipped: true as const };
    }

    const { subject, html, text } = buildFulfillmentEmailContent(input);

    const { data, error } = await resend.emails.send({
        from: resendFromEmail,
        to: [input.printShopEmail],
        cc: [input.userEmail],
        replyTo: resendReplyToEmail,
        subject,
        html,
        text,
        headers: {
            'X-Fulfillment-Ref': buildFulfillmentRef(input.fulfillmentId),
        },
    });

    if (error) {
        console.error('[FULFILLMENT EMAIL] Failed to send', error);
        return { error: error.message };
    }

    return { success: true as const, emailId: data?.id };
}
