import { motion } from "framer-motion";

export function VendorsTableSection({ isActive, isLoading, vendors }) {
  return (
    <div className={isActive ? undefined : "hidden"}>
      {!isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="surface-card overflow-x-auto"
        >
          <table className="data-table">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3">Contact Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="text-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-900">{vendor.name || "-"}</td>
                  <td className="px-4 py-3">{vendor.serviceType || "-"}</td>
                  <td className="px-4 py-3">{vendor.contactEmail || "-"}</td>
                </tr>
              ))}
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No vendors found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </motion.div>
      ) : null}
    </div>
  );
}
