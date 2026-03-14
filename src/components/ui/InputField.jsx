import { EyeOffIcon, EyeOnIcon, CheckIcon, CircleIcon } from "@/components/ui/Icons";

export const InputField = ({
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
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex">
        {icon}
      </span>
      <input
        type={showToggle ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        {...props}
        className={`w-full h-11 rounded-[10px] border bg-white text-slate-900 pl-9 pr-10 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#2e4057] focus:border-transparent ${
          error ? "border-red-400 ring-2 ring-red-100" : "border-slate-200"
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon /> : <EyeOnIcon />}
        </button>
      )}
    </div>
    {error && (
      <p id={ariaDescribedBy} className="mt-1.5 text-xs text-red-600" aria-live="polite">
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
