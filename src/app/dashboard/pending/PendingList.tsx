'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Employee, Location } from '@/lib/types';

interface EmployeeWithLocations extends Employee {
  locations: Location[];
}

interface PendingListProps {
  employees: EmployeeWithLocations[];
}

export default function PendingList({ employees: initialEmployees }: PendingListProps) {
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);

    try {
      const response = await fetch(`/api/admin/approve/${id}`, {
        method: 'POST',
      });

      if (response.ok) {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject and delete this submission?')) {
      return;
    }

    setProcessingId(id);

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-[var(--stone-800)] mb-2">All caught up!</h2>
        <p className="text-[var(--stone-500)]">No pending employee approvals at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <div key={employee.id} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex gap-6">
            {/* Photo */}
            <div className="w-24 h-24 rounded-xl bg-[var(--stone-100)] overflow-hidden flex-shrink-0">
              {employee.photo_url ? (
                <Image
                  src={employee.photo_url}
                  alt={employee.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--stone-400)]">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--stone-800)]">{employee.name}</h3>

              {employee.bio && (
                <p className="text-[var(--stone-600)] text-sm mt-1 italic">&ldquo;{employee.bio}&rdquo;</p>
              )}

              {/* Locations */}
              <div className="flex flex-wrap gap-1 mt-3">
                {employee.locations.map((loc) => (
                  <span
                    key={loc.id}
                    className="inline-block px-2 py-1 bg-[var(--stone-100)] text-[var(--stone-700)] text-xs rounded"
                  >
                    {loc.name}
                  </span>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="flex gap-2 mt-3 text-xs">
                {employee.venmo && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Venmo: {employee.venmo}
                  </span>
                )}
                {employee.cashapp && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    Cash App: {employee.cashapp}
                  </span>
                )}
                {employee.zelle && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    Zelle: {employee.zelle}
                  </span>
                )}
              </div>

              {/* Submitted Date */}
              <p className="text-xs text-[var(--stone-400)] mt-3">
                Submitted {new Date(employee.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleApprove(employee.id)}
                disabled={processingId === employee.id}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {processingId === employee.id ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(employee.id)}
                disabled={processingId === employee.id}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
