export function AttendeeStatusBadge({ status }) {
  const colours = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-900 border-red-300",
    pending: "bg-amber-100 text-amber-900 border-amber-300",
  };

  const classes = colours[status?.toLowerCase()] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${classes}`}>
      {status ?? "-"}
    </span>
  );
}
