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

    if (!error) {
      // Get user to determine redirect
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
          .single();

        if (userData?.role === 'super_admin') {
          // Redirect to super admin dashboard
          const adminUrl = new URL(requestUrl.origin);
          adminUrl.pathname = '/admin';
          return NextResponse.redirect(adminUrl);
        }

        // Get user's organization
        const { data: membership } = await adminSupabase
          .from('organization_members')
          .select('organization_id, organizations(slug)')
          .eq('user_id', user.id)
          .single();

        if (membership?.organizations) {
          // Redirect to organization dashboard
          const org = membership.organizations as unknown as { slug: string };
          const dashboardUrl = new URL(`https://${org.slug}.${APP_DOMAIN}/dashboard`);
          return NextResponse.redirect(dashboardUrl);
        }

        // No organization - redirect to onboarding
        const onboardingUrl = new URL('/onboarding', requestUrl.origin);
        return NextResponse.redirect(onboardingUrl);
      }

      // Default redirect
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Auth error - redirect to login with error
  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'auth_failed');
  return NextResponse.redirect(loginUrl);
}
