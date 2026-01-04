export default function LocationDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-4 w-32 bg-[var(--stone-200)] rounded" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="h-8 w-48 bg-[var(--stone-200)] rounded mb-2" />
        <div className="h-4 w-40 bg-[var(--stone-100)] rounded" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--stone-200)]">
          <div className="h-6 w-32 bg-[var(--stone-200)] rounded" />
        </div>

        <div className="divide-y divide-[var(--stone-200)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--stone-200)]" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-[var(--stone-200)] rounded mb-2" />
                <div className="h-4 w-48 bg-[var(--stone-100)] rounded" />
              </div>
              <div className="h-4 w-12 bg-[var(--stone-100)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
