import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createAdminClient } from './supabase';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function verifyPassword(password: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('admin_settings')
    .select('password_hash')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return false;
  }

  return bcrypt.compare(password, data.password_hash);
}

export async function createSession(): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return sessionToken;
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
