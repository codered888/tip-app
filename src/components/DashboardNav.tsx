'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const navItems = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/employees', label: 'Employees' },
  { href: '/dashboard/locations', label: 'Locations' },
  { href: '/dashboard/pending', label: 'Pending' },
];

interface DashboardNavProps {
  orgName: string;
}

export default function DashboardNav({ orgName }: DashboardNavProps) {
  const pathname = usePathname();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b border-[var(--stone-200)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-semibold text-[var(--stone-800)]">
              {orgName}
            </Link>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--sage-500)] text-white'
                        : 'text-[var(--stone-600)] hover:bg-[var(--stone-100)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--stone-500)] hover:text-[var(--stone-700)]"
            >
              View Tip Page
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--stone-600)] hover:text-[var(--stone-900)]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
