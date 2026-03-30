export function OtpDigitFields({ otp, inputRefs, onChange, onKeyDown, onPaste }) {
  return (
    <fieldset className="mb-7 flex justify-center gap-2.5 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => onChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={index === 0 ? onPaste : undefined}
          className={`
            h-14 w-11 rounded-xl border-2 bg-white text-center text-xl font-bold text-slate-900
            outline-none transition-all duration-200
            placeholder:text-slate-300
            focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 focus:shadow-lg focus:shadow-violet-500/10
            sm:h-14 sm:w-12
            ${digit
              ? "border-violet-400 bg-violet-50/50 shadow-sm"
              : "border-slate-200 hover:border-slate-300"
            }
          `}
          placeholder="·"
          autoFocus={index === 0}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </fieldset>
  );
}
