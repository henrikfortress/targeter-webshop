import { Resend } from 'resend';

export const resendApiKey = process.env.RESEND_API_KEY;
export const resendFromEmail = process.env.RESEND_FROM;

export function getResendClient() {
    if (!resendApiKey) return null;
    return new Resend(resendApiKey);
}
