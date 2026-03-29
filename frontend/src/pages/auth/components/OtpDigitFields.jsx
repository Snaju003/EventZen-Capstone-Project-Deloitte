export function OtpDigitFields({ otp, inputRefs, onChange, onKeyDown }) {
  return (
    <fieldset className="mb-7 flex justify-center gap-2 sm:gap-3">
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
          className="h-12 w-10 rounded-[10px] border border-slate-200 text-center text-lg font-semibold text-slate-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#2e4057] sm:w-11"
          autoFocus={index === 0}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </fieldset>
  );
}
