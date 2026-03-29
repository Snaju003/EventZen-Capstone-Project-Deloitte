import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ChevronDown } from "lucide-react";

export function EventVendorDropdown({ vendors, value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedVendor = vendors.find((vendor) => vendor.id === value);

  useEffect(() => {
    const handler = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        <Building2 className="h-3.5 w-3.5 text-primary/70" />
        Assign Vendor
        {required ? <span className="text-red-400">*</span> : null}
      </label>
      <p className="text-[10px] text-slate-400">Select a vendor to manage this event</p>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className={selectedVendor ? "font-medium text-slate-800" : "text-slate-400"}>
          {selectedVendor ? selectedVendor.name : "Select a vendor..."}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl"
          >
            {vendors.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No vendors available</p>
            ) : vendors.map((vendor) => (
              <button
                key={vendor.id}
                type="button"
                onClick={() => {
                  onChange(vendor.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${vendor.id === value ? "bg-primary/10 font-semibold text-primary" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{vendor.name}</p>
                  {vendor.serviceType ? <p className="truncate text-[11px] text-slate-400">{vendor.serviceType}</p> : null}
                </div>
                {vendor.id === value ? <div className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
