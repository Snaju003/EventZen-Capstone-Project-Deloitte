import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-primary">
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
          className={`h-11 w-full rounded-xl border bg-white/80 pl-9 pr-10 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:ring-0 ${
            error
              ? "border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
              : "border-slate-200/80 hover:border-slate-300"
          }`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeOnIcon />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={resolvedDescriptionId}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-xs font-medium text-red-600"
            aria-live="polite"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {requirements && (
        <ul className="mt-2.5 space-y-1" aria-live="polite">
          {requirements.map((req) => (
            <li
              key={req.label}
              className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                req.isMet ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <span
                className={`flex size-4 items-center justify-center rounded-full transition-all duration-300 ${
                  req.isMet
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {req.isMet ? <CheckIcon /> : <CircleIcon />}
              </span>
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
