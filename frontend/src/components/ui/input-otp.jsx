import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

function sanitizeDigits(value, maxLength) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, maxLength);
}

export function InputOTP({
  value = "",
  onChange,
  maxLength = 6,
  disabled = false,
  autoFocus = false,
  className,
  inputClassName,
}) {
  const normalizedValue = useMemo(
    () => sanitizeDigits(value, maxLength),
    [maxLength, value],
  );

  const refs = useRef([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, maxLength);
  }, [maxLength]);

  useEffect(() => {
    if (!autoFocus || disabled) return;

    const firstEmptyIndex = Math.max(0, normalizedValue.length - 1);
    const target = refs.current[firstEmptyIndex] || refs.current[0];
    target?.focus();
  }, [autoFocus, disabled, normalizedValue.length]);

  const setValueAt = (index, digit) => {
    const chars = normalizedValue.split("");
    while (chars.length < maxLength) chars.push("");
    chars[index] = digit;
    const nextValue = sanitizeDigits(chars.join(""), maxLength);
    onChange?.(nextValue);
  };

  const handleChange = (index, raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) {
      setValueAt(index, "");
      return;
    }

    const chars = normalizedValue.split("");
    while (chars.length < maxLength) chars.push("");

    let cursor = index;
    for (const digit of digits) {
      if (cursor >= maxLength) break;
      chars[cursor] = digit;
      cursor += 1;
    }

    onChange?.(sanitizeDigits(chars.join(""), maxLength));

    const focusIndex = Math.min(cursor, maxLength - 1);
    refs.current[focusIndex]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (normalizedValue[index]) {
        setValueAt(index, "");
        return;
      }

      if (index > 0) {
        refs.current[index - 1]?.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < maxLength - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = sanitizeDigits(event.clipboardData?.getData("text") || "", maxLength);
    if (!pasted) return;
    onChange?.(pasted);
    const focusIndex = Math.min(pasted.length, maxLength - 1);
    refs.current[focusIndex]?.focus();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={maxLength}
          value={normalizedValue[index] || ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "h-11 w-10 rounded-lg border border-slate-300 bg-slate-50 text-center text-lg font-semibold text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 sm:w-11",
            inputClassName,
          )}
        />
      ))}
    </div>
  );
}
