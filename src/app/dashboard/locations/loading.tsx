export default function LocationsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-32 bg-[var(--stone-200)] rounded mb-8" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-40 bg-[var(--stone-200)] rounded mb-2" />
                <div className="h-4 w-24 bg-[var(--stone-100)] rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-[var(--stone-100)] rounded" />
                <div className="h-8 w-16 bg-[var(--stone-100)] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
