export function RouteLoadingFallback({ message = "Preparing your workspace..." }) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-10" role="status" aria-live="polite">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
