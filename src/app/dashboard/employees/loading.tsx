export default function EmployeesLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-32 bg-[var(--stone-200)] rounded" />
        <div className="h-10 w-32 bg-[var(--stone-200)] rounded-lg" />
      </div>

      <div className="h-6 w-40 bg-[var(--stone-200)] rounded mb-4" />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="w-10 h-10 rounded-full bg-[var(--stone-200)]" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-[var(--stone-200)] rounded mb-2" />
                <div className="h-3 w-48 bg-[var(--stone-100)] rounded" />
              </div>
              <div className="h-6 w-16 bg-[var(--stone-100)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
