export function AttendeeCancelButton({ status, onClick, isLoading }) {
  if (status === "cancelled") {
    return <span className="text-xs text-slate-400">Cancelled</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-900 transition-colors hover:bg-red-200 active:scale-95 disabled:opacity-60"
    >
      {isLoading ? "Cancelling..." : "Cancel"}
    </button>
  );
}
