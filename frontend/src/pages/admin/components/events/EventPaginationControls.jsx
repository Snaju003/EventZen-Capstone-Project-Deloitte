export function EventPaginationControls({ isLoading, onNext, onPrevious, pageMeta }) {
  if (pageMeta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-sm text-slate-600">
        Page {pageMeta.page} of {pageMeta.totalPages} • {pageMeta.total} events
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={pageMeta.page <= 1 || isLoading}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!pageMeta.hasNext || isLoading}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
