import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// App domain configuration
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'modelnets.com';
const LOCALHOST_DOMAIN = 'localhost:3000';

// Routes that require authentication check
const PROTECTED_PATHS = ['/dashboard', '/admin'];
const PUBLIC_PATHS = ['/', '/login', '/signup', '/location', '/auth', '/api', '/onboarding'];

function needsAuthCheck(pathname: string, subdomain: string | null): boolean {
  // Admin subdomain: protect everything except login
  if (subdomain === 'admin') {
    return !pathname.startsWith('/login');
  }
  // Tenant subdomain: only protect dashboard
  if (subdomain) {
    return pathname.startsWith('/dashboard');
  }
  // Marketing domain: no auth needed
  return false;
}

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

  // Set headers based on subdomain type
  const requestHeaders = new Headers(request.headers);

  if (subdomain === 'admin') {
    requestHeaders.set('x-subdomain-type', 'superadmin');
    requestHeaders.set('x-subdomain', 'admin');
  } else if (subdomain) {
    requestHeaders.set('x-subdomain-type', 'tenant');
    requestHeaders.set('x-subdomain', subdomain);
    requestHeaders.set('x-organization-slug', subdomain);
  } else {
    requestHeaders.set('x-subdomain-type', 'marketing');
  }

  // Only check auth for protected routes (skip for public pages)
  if (!needsAuthCheck(url.pathname, subdomain)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Create Supabase client only when auth check is needed
  const isProduction = hostname.includes(APP_DOMAIN);
  const cookieDomain = isProduction ? `.${APP_DOMAIN}` : undefined;

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

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
            request: {
              headers: requestHeaders,
            },
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

  // Check session for protected routes
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Redirect to login if not authenticated
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response;
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
