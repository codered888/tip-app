import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from './supabase';

// ============================================
// Supabase Auth Client (Server-side)
// ============================================

export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
            // Ignore in Server Components
          }
        },
      },
    }
  );
}

// ============================================
// Authentication Helpers
// ============================================

export async function getCurrentUser() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return data?.role === 'super_admin';
}

// ============================================
// Organization Context Helpers
// ============================================

export async function getOrganizationFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-organization-slug');
}

export async function getOrganizationId(): Promise<string | null> {
  const orgSlug = await getOrganizationFromHeaders();
  if (!orgSlug) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single();

  return data?.id || null;
}

export async function requireOrganization(): Promise<string> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    throw new Error('Organization not found');
  }
  return orgId;
}

export async function hasOrgAccess(organizationId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Super admins have access to all orgs
  if (await isSuperAdmin()) return true;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single();

  return data !== null;
}

export async function requireOrgAccess(organizationId: string): Promise<void> {
  const hasAccess = await hasOrgAccess(organizationId);
  if (!hasAccess) {
    throw new Error('Access denied');
  }
}

// ============================================
// Legacy Support (for old admin routes during transition)
// ============================================

const SESSION_COOKIE_NAME = 'admin_session';

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

// Legacy isAuthenticated that checks both old session and new Supabase auth
export async function isAuthenticatedLegacy(): Promise<boolean> {
  // Check new Supabase auth first
  const user = await getCurrentUser();
  if (user) return true;

  // Fall back to legacy session check
  const session = await getSession();
  return session !== null;
}
