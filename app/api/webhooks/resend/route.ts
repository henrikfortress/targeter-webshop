import { NextResponse } from 'next/server';
import { updateFulfillmentFromReply } from '@/lib/actions/fulfillment';
import { getResendClient } from '@/lib/email/resend';

type ResendEmailReceivedEvent = {
    type: 'email.received';
    data: {
        email_id: string;
        from: string;
        to: string[];
        subject: string;
    };
};

export async function POST(request: Request) {
    const payload = await request.text();

    let event: ResendEmailReceivedEvent;

    try {
        event = JSON.parse(payload) as ResendEmailReceivedEvent;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (webhookSecret) {
        const resend = getResendClient();

        if (!resend) {
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
        }

        try {
            resend.webhooks.verify({
                payload,
                headers: {
                    id: request.headers.get('svix-id') ?? '',
                    timestamp: request.headers.get('svix-timestamp') ?? '',
                    signature: request.headers.get('svix-signature') ?? '',
                },
                webhookSecret,
            });
        } catch (error) {
            console.error('[RESEND WEBHOOK] Signature verification failed', error);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
    }

    if (event.type !== 'email.received') {
        return NextResponse.json({ received: true });
    }

    const resend = getResendClient();

    if (!resend) {
        return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const { data: email, error } = await resend.emails.receiving.get(event.data.email_id);

    if (error || !email) {
        console.error('[RESEND WEBHOOK] Failed to fetch received email', error);
        return NextResponse.json({ error: 'Failed to fetch email' }, { status: 500 });
    }

    const result = await updateFulfillmentFromReply({
        subject: email.subject ?? event.data.subject ?? '',
        text: email.text,
        html: email.html,
        from: email.from ?? event.data.from,
    });

    if ('error' in result && result.error) {
        console.warn('[RESEND WEBHOOK] Could not update fulfillment:', result.error);
    }

    return NextResponse.json({ received: true, result });
}
