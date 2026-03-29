export function EventStatusFilterPills({ statusFilter, onStatusChange, eventCounts }) {
  const options = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending Approval" },
    { value: "published", label: "Published" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((filterItem) => (
        <button
          key={filterItem.value}
          type="button"
          onClick={() => onStatusChange(filterItem.value)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            statusFilter === filterItem.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          {filterItem.label}
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
            {eventCounts?.[filterItem.value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
