import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// App domain configuration
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'modelnets.com';
const LOCALHOST_DOMAIN = 'localhost:3000';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Determine subdomain
  let subdomain: string | null = null;

  if (hostname.includes(APP_DOMAIN)) {
    // Production: extract subdomain from modelnets.com
    const parts = hostname.replace(`.${APP_DOMAIN}`, '').split('.');
    if (parts[0] && parts[0] !== 'www' && parts[0] !== APP_DOMAIN.split('.')[0]) {
      subdomain = parts[0];
    }
  } else if (hostname.includes(LOCALHOST_DOMAIN)) {
    // Local development: use query param ?org=slug or header
    subdomain = url.searchParams.get('org') || null;
  }

  // Create Supabase client for middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Determine cookie domain for cross-subdomain auth
  const isProduction = hostname.includes(APP_DOMAIN);
  const cookieDomain = isProduction ? `.${APP_DOMAIN}` : undefined;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              domain: cookieDomain,
            })
          );
        },
      },
    }
  );

  // Refresh session if exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Set headers based on subdomain type
  const requestHeaders = new Headers(request.headers);

  if (subdomain === 'admin') {
    // Super-admin subdomain
    requestHeaders.set('x-subdomain-type', 'superadmin');
    requestHeaders.set('x-subdomain', 'admin');

    // Protect super-admin routes - require authentication
    if (!session && !url.pathname.startsWith('/login')) {
      // Redirect to login if not authenticated
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else if (subdomain) {
    // Tenant subdomain - lookup organization
    requestHeaders.set('x-subdomain-type', 'tenant');
    requestHeaders.set('x-subdomain', subdomain);
    requestHeaders.set('x-organization-slug', subdomain);

    // For dashboard routes, require authentication
    if (url.pathname.startsWith('/dashboard') && !session) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // Root domain - marketing pages
    requestHeaders.set('x-subdomain-type', 'marketing');
  }

  // Return response with updated headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
