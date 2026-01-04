export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="h-8 w-16 bg-[var(--stone-200)] rounded mb-2" />
            <div className="h-4 w-24 bg-[var(--stone-100)] rounded" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="h-5 w-32 bg-[var(--stone-200)] rounded mb-2" />
            <div className="h-4 w-48 bg-[var(--stone-100)] rounded" />
          </div>
        ))}
      </div>

      {/* Locations skeleton */}
      <div className="h-6 w-32 bg-[var(--stone-200)] rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="h-5 w-28 bg-[var(--stone-200)] rounded mb-2" />
            <div className="h-4 w-20 bg-[var(--stone-100)] rounded mb-3" />
            <div className="h-4 w-24 bg-[var(--stone-100)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
