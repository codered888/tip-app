import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'modelnets.com';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  // Set cookies on parent domain for cross-subdomain auth
  const cookieDomain = `.${APP_DOMAIN}`;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, {
                  ...options,
                  domain: cookieDomain,
                })
              );
            } catch {
              // Ignore cookie setting errors in edge cases
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback - exchangeCodeForSession error:', {
        message: error.message,
        code: error.code,
        status: error.status,
      });
      // Redirect with actual error message
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', error.message || 'auth_failed');
      return NextResponse.redirect(loginUrl);
    }

    // Success - get user to determine redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Use admin client to bypass RLS for lookups
      const adminSupabase = createAdminClient();

      // Check if user is super admin
      const { data: userData } = await adminSupabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (userData?.role === 'super_admin') {
        // Redirect to super admin dashboard
        const adminUrl = new URL(requestUrl.origin);
        adminUrl.pathname = '/admin';
        return NextResponse.redirect(adminUrl);
      }

      // Get user's organization membership (get first one if multiple)
      const { data: memberships, error: membershipError } = await adminSupabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const membership = memberships?.[0] || null;

      console.log('Auth callback - membership lookup:', {
        userId: user.id,
        membership,
        totalMemberships: memberships?.length || 0,
        error: membershipError
      });

      if (membership?.organization_id) {
        // Get organization slug separately
        const { data: org, error: orgError } = await adminSupabase
          .from('organizations')
          .select('slug')
          .eq('id', membership.organization_id)
          .single();

        console.log('Auth callback - org lookup:', {
          orgId: membership.organization_id,
          org,
          error: orgError
        });

        if (org?.slug) {
          const dashboardUrl = `https://${org.slug}.${APP_DOMAIN}/dashboard`;
          console.log('Auth callback - redirecting to:', dashboardUrl);
          return NextResponse.redirect(dashboardUrl);
        }
      }

      // No organization - redirect to onboarding
      const onboardingUrl = new URL('/onboarding', requestUrl.origin);
      return NextResponse.redirect(onboardingUrl);
    }

    // Default redirect
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code param - redirect to login with error
  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'No authentication code provided');
  return NextResponse.redirect(loginUrl);
}
