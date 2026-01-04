'use client';

import Image from 'next/image';
import type { Employee } from '@/lib/types';

interface EmployeeCardProps {
  employee: Employee;
}

const paymentButtons = {
  venmo: {
    label: 'Venmo',
    bg: 'bg-[var(--venmo-blue)]',
    hover: 'hover:bg-[#0070cc]',
    getUrl: (v: string) => `https://venmo.com/${v.replace('@', '')}`,
  },
  cashapp: {
    label: 'Cash App',
    bg: 'bg-[var(--cashapp-green)]',
    hover: 'hover:bg-[#00b82b]',
    getUrl: (v: string) => `https://cash.app/${v.startsWith('$') ? v : '$' + v}`,
  },
  zelle: {
    label: 'Zelle',
    bg: 'bg-[var(--zelle-purple)]',
    hover: 'hover:bg-[#5a19b0]',
    getUrl: () => '',
  },
};

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleZelleClick = (value: string) => {
    navigator.clipboard.writeText(value);
    // Could add a toast notification here
    alert(`Zelle info copied: ${value}`);
  };

  return (
    <article
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:bg-white"
      style={{
        boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden bg-gradient-to-br from-[var(--sage-100)] to-[var(--sage-200)] ring-2 ring-[var(--sage-200)] group-hover:ring-[var(--sage-300)] transition-all duration-300">
            {employee.photo_url ? (
              <Image
                src={employee.photo_url}
                alt={employee.name}
                width={76}
                height={76}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xl font-semibold text-[var(--sage-500)] tracking-tight">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-lg font-semibold text-[var(--stone-800)] tracking-tight leading-tight">
            {employee.name}
          </h3>

          {employee.bio && (
            <p className="mt-1.5 text-sm text-[var(--stone-500)] leading-relaxed font-light italic">
              &ldquo;{employee.bio}&rdquo;
            </p>
          )}

          {/* Payment Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {employee.venmo && (
              <a
                href={paymentButtons.venmo.getUrl(employee.venmo)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center px-4 py-2.5 rounded-full text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${paymentButtons.venmo.bg} ${paymentButtons.venmo.hover} active:scale-95`}
              >
                Venmo
              </a>
            )}
            {employee.cashapp && (
              <a
                href={paymentButtons.cashapp.getUrl(employee.cashapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center px-4 py-2.5 rounded-full text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${paymentButtons.cashapp.bg} ${paymentButtons.cashapp.hover} active:scale-95`}
              >
                Cash App
              </a>
            )}
            {employee.zelle && (
              <button
                onClick={() => handleZelleClick(employee.zelle!)}
                className={`inline-flex items-center px-4 py-2.5 rounded-full text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${paymentButtons.zelle.bg} ${paymentButtons.zelle.hover} active:scale-95`}
              >
                Zelle
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
