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

export const FULFILLMENT_REF_PREFIX = 'FULFILLMENT:';

const CANCELLABLE_STATUSES = ['pending', 'sent', 'confirmed'] as const satisfies readonly FulfillmentStatus[];
const TERMINAL_STATUSES = ['delivered', 'cancelled'] as const satisfies readonly FulfillmentStatus[];

export function buildFulfillmentRef(fulfillmentId: string) {
    return `${FULFILLMENT_REF_PREFIX}${fulfillmentId}`;
}

export function parseFulfillmentRef(text: string): string | null {
    const match = text.match(/FULFILLMENT:([a-f0-9-]{36})/i);
    return match?.[1] ?? null;
}

export function canCancelOrder(fulfillments: { status: FulfillmentStatus }[]): boolean {
    if (fulfillments.length === 0) return false;
    return fulfillments.every((entry) =>
        CANCELLABLE_STATUSES.includes(entry.status as (typeof CANCELLABLE_STATUSES)[number]),
    );
}

export function canUpdateFulfillmentStatus(current: FulfillmentStatus): boolean {
    return !TERMINAL_STATUSES.includes(current as (typeof TERMINAL_STATUSES)[number]);
}

export function getNextStatuses(current: FulfillmentStatus): FulfillmentStatus[] {
    switch (current) {
        case 'pending':
        case 'sent':
            return ['confirmed', 'cancelled'];
        case 'confirmed':
            return ['in_production', 'cancelled'];
        case 'in_production':
            return ['shipped', 'cancelled'];
        case 'shipped':
            return ['delivered'];
        default:
            return [];
    }
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

export function getFulfillmentStatusActionLabel(status: FulfillmentStatus): string {
    switch (status) {
        case 'confirmed':
            return 'Bekreft';
        case 'in_production':
            return 'Start produksjon';
        case 'shipped':
            return 'Send';
        case 'delivered':
            return 'Lever';
        case 'cancelled':
            return 'Kanseller';
        default:
            return getFulfillmentStatusLabel(status);
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
