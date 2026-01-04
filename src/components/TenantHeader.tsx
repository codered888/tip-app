'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Location {
  id: string;
  name: string;
  slug: string;
}

interface TenantHeaderProps {
  orgName: string;
  currentLocation?: Location;
  locations?: Location[];
  showLocationSwitcher?: boolean;
}

export default function TenantHeader({
  orgName,
  currentLocation,
  locations = [],
  showLocationSwitcher = false,
}: TenantHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const otherLocations = locations.filter((loc) => loc.id !== currentLocation?.id);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[var(--stone-200)]">
      <div className="max-w-lg mx-auto px-5 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Org Name */}
          <Link
            href="/"
            className="text-sm font-medium text-[var(--stone-600)] hover:text-[var(--stone-800)] transition-colors"
          >
            {orgName}
          </Link>

          {/* Center: Location Switcher (optional) */}
          {showLocationSwitcher && currentLocation && otherLocations.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--sage-50)] hover:bg-[var(--sage-100)] rounded-full text-sm font-medium text-[var(--stone-700)] transition-colors"
              >
                <span>{currentLocation.name}</span>
                <svg
                  className={`w-4 h-4 text-[var(--stone-400)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-lg border border-[var(--stone-200)] py-2 min-w-[180px] animate-fade-in">
                  {otherLocations.map((loc) => (
                    <Link
                      key={loc.id}
                      href={`/location/${loc.slug}`}
                      className="block px-4 py-2 text-sm text-[var(--stone-600)] hover:bg-[var(--sage-50)] hover:text-[var(--stone-800)] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {loc.name}
                    </Link>
                  ))}
                  <div className="border-t border-[var(--stone-200)] mt-2 pt-2">
                    <Link
                      href="/"
                      className="block px-4 py-2 text-sm text-[var(--sage-600)] hover:bg-[var(--sage-50)] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View all locations
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right: Owner Login */}
          <Link
            href="/login"
            className="text-xs font-medium text-[var(--stone-400)] hover:text-[var(--stone-600)] transition-colors"
          >
            Owner Login
          </Link>
        </div>
      </div>
    </header>
  );
}
