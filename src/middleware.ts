import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const currentUrl = new URL(req.url);
    const isAccessingDashboard = currentUrl.pathname === '/home';
    const isApiReq = currentUrl.pathname.startsWith('/api');

    if (req.nextUrl.pathname === '/')
        return NextResponse.redirect(new URL('/home', req.url));

    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    //
    if (!userId) {
        if (!isPublicAPIRoute(req) && !isPublicRoute(req))
            return NextResponse.redirect(new URL('/sign-in', req.url));

        if (isApiReq && !isPublicAPIRoute(req))
            return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
});

const isPublicRoute = createRouteMatcher([
    '/sign-in',
    '/sign-up',
    '/',
    '/home',
]);

const isPublicAPIRoute = createRouteMatcher(['/api/videos']);

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
