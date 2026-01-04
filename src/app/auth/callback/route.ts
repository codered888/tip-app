import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

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
                cookieStore.set(name, value, options)
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
        // Check if user is super admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData?.role === 'super_admin') {
          // Redirect to super admin dashboard
          const adminUrl = new URL(requestUrl.origin);
          // In production, this would be admin.tip-app.vercel.app
          adminUrl.pathname = '/admin';
          return NextResponse.redirect(adminUrl);
        }

        // Get user's organization
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id, organizations(slug)')
          .eq('user_id', user.id)
          .single();

        if (membership?.organizations) {
          // Redirect to organization dashboard
          // In production: {slug}.tip-app.vercel.app/dashboard
          const org = membership.organizations as unknown as { slug: string };
          const dashboardUrl = new URL(requestUrl.origin);
          dashboardUrl.pathname = '/dashboard';
          dashboardUrl.searchParams.set('org', org.slug);
          return NextResponse.redirect(dashboardUrl);
        }
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
