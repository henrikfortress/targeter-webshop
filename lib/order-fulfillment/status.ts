export const FULFILLMENT_STATUSES = [
    'pending',
    'sent',
    'confirmed',
    'in_production',
    'shipped',
    'delivered',
    'cancelled',
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const STATUS_KEYWORDS: Record<string, FulfillmentStatus> = {
    CONFIRMED: 'confirmed',
    CONFIRM: 'confirmed',
    BEKREFTET: 'confirmed',
    IN_PRODUCTION: 'in_production',
    PRODUCTION: 'in_production',
    PRODUKSJON: 'in_production',
    SHIPPED: 'shipped',
    SENDT: 'shipped',
    DELIVERED: 'delivered',
    DELIVER: 'delivered',
    LEVERT: 'delivered',
    CANCELLED: 'cancelled',
    CANCELED: 'cancelled',
    AVBRUTT: 'cancelled',
    KANSELLERT: 'cancelled',
};

export const FULFILLMENT_REF_PREFIX = 'FULFILLMENT:';

export function buildFulfillmentRef(fulfillmentId: string) {
    return `${FULFILLMENT_REF_PREFIX}${fulfillmentId}`;
}

export function parseFulfillmentRef(text: string): string | null {
    const match = text.match(/FULFILLMENT:([a-f0-9-]{36})/i);
    return match?.[1] ?? null;
}

export function parseStatusKeyword(text: string): FulfillmentStatus | null {
    const replySection = text.split(/\n(?=>|On .+ wrote:|Den .+ skrev:|-----Original Message-----)/i)[0] ?? text;

    const tokens = replySection
        .toUpperCase()
        .replace(/[^A-ZÆØÅ0-9_\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    for (const token of tokens) {
        const status = STATUS_KEYWORDS[token];
        if (status) {
            return status;
        }
    }

    return null;
}

export function getFulfillmentStatusLabel(status: FulfillmentStatus): string {
    switch (status) {
        case 'pending':
            return 'Venter';
        case 'sent':
            return 'Sendt til trykkeri';
        case 'confirmed':
            return 'Bekreftet';
        case 'in_production':
            return 'I produksjon';
        case 'shipped':
            return 'Sendt';
        case 'delivered':
            return 'Levert';
        case 'cancelled':
            return 'Kansellert';
    }
}

export function getFulfillmentStatusVariant(
    status: FulfillmentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'delivered':
            return 'default';
        case 'cancelled':
            return 'destructive';
        case 'pending':
        case 'sent':
            return 'outline';
        default:
            return 'secondary';
    }
}
