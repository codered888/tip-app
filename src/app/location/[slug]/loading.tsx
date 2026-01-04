export default function LocationLoading() {
  return (
    <div className="min-h-screen bg-[var(--cream)] animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-[var(--stone-200)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="h-6 w-40 bg-[var(--stone-200)] rounded mx-auto" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-[var(--stone-200)] rounded mb-2 mx-auto" />
        <div className="h-4 w-32 bg-[var(--stone-100)] rounded mb-8 mx-auto" />

        {/* Employee cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--stone-200)]" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-[var(--stone-200)] rounded mb-2" />
                  <div className="h-4 w-48 bg-[var(--stone-100)] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
