export function EventFieldLabel({ icon: Icon, label, hint, required }) {
  return (
    <div className="mb-1 flex flex-col gap-0.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {Icon ? <Icon className="h-3.5 w-3.5 text-primary/70" /> : null}
        {label}
        {required ? <span className="text-red-400">*</span> : null}
      </label>
      {hint ? <p className="text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}
