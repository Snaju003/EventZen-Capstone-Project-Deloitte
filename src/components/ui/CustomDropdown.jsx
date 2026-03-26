import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * A beautiful custom dropdown/select component.
 *
 * Props:
 *  - label        (string)   – the field label shown above the select
 *  - options      (array)    – [{ value: string, label: string }]
 *  - value        (string)   – currently selected value
 *  - onChange     (function) – receives the new value string
 *  - placeholder  (string)   – shown when nothing is selected
 *  - disabled     (boolean)
 *  - id           (string)   – optional id override
 */
export default function CustomDropdown({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    disabled = false,
    id: externalId,
}) {
    const internalId = useId();
    const controlId = externalId || internalId;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (event) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen]);

    const handleSelect = (optionValue) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label
                    htmlFor={controlId}
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}
            <button
                id={controlId}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm transition-all ${
                    isOpen
                        ? "border-primary/50 ring-2 ring-primary/20"
                        : "border-slate-200 hover:border-slate-300"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/8 animate-in fade-in slide-in-from-top-1"
                    style={{ animation: "dropdownIn 0.15s ease-out" }}
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelect(option.value)}
                                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors ${
                                    isSelected
                                        ? "bg-primary/5 font-medium text-primary"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <span>{option.label}</span>
                                {isSelected && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                            </li>
                        );
                    })}
                    {options.length === 0 && (
                        <li className="px-3 py-4 text-center text-sm text-slate-400">No options available</li>
                    )}
                </ul>
            )}

            {/* Inline keyframes for the dropdown animation */}
            <style>{`
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
