import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasAdminRole } from '@/lib/auth-utils';

const loginPath = '/login';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL(loginPath, request.url));
        }

        if (!hasAdminRole(session.user.role)) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    }

    if (pathname === loginPath) {
        if (session) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    }

    if (pathname === '/' || pathname === '/orders') {
        if (!session) {
            return NextResponse.redirect(new URL(loginPath, request.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/orders', '/login', '/admin/:path*'],
};
