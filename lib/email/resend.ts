import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

export const resendFromEmail = process.env.RESEND_FROM;
export const resendReplyToEmail = process.env.RESEND_REPLY_TO;

export function getResendClient() {
    if (!apiKey) {
        return null;
    }

    return new Resend(apiKey);
}

export function isEmailConfigured() {
    return Boolean(apiKey);
}
