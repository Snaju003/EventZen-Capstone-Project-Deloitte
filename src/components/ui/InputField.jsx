import { useId } from "react";
import { EyeOffIcon, EyeOnIcon, CheckIcon, CircleIcon } from "@/components/ui/Icons";

export function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  showPassword,
  onToggle,
  error,
  requirements,
  ariaDescribedBy,
  ...props
}) {
  const inputId = useId();
  const resolvedDescriptionId = ariaDescribedBy || `${inputId}-description`;

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          id={inputId}
          type={showToggle ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? resolvedDescriptionId : undefined}
          {...props}
          className={`h-11 w-full rounded-[10px] border bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#2e4057] ${
            error ? "border-red-400 ring-2 ring-red-100" : "border-slate-200"
          }`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeOnIcon />}
          </button>
        )}
      </div>
      {error && (
        <p id={resolvedDescriptionId} className="mt-1.5 text-xs text-red-700" aria-live="polite">
          {error}
        </p>
      )}
      {requirements && (
        <ul className="mt-2.5 space-y-1.5" aria-live="polite">
          {requirements.map((req) => (
            <li
              key={req.label}
              className={`flex items-center gap-2 text-xs transition-colors ${
                req.isMet ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {req.isMet ? <CheckIcon /> : <CircleIcon />}
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
