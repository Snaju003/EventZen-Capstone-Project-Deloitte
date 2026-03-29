export function EventDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="surface-card p-6 lg:col-span-2">
        <div className="skeleton-pulse mb-5 h-64 w-full rounded-xl" />
        <div className="skeleton-pulse mb-3 h-8 w-2/3" />
        <div className="skeleton-pulse mb-4 h-4 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="skeleton-pulse h-20 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="surface-card p-6">
        <div className="skeleton-pulse mb-3 h-6 w-1/2" />
        <div className="skeleton-pulse mb-4 h-4 w-3/4" />
        <div className="skeleton-pulse mb-3 h-24 rounded-lg" />
        <div className="skeleton-pulse h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
