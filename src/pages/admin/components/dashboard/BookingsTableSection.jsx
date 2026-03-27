import { motion } from "framer-motion";

import { formatDashboardDate } from "@/pages/admin/components/dashboard/dashboard.utils";

export function BookingsTableSection({ bookingRows, isActive, isLoading }) {
  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    show: (index) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, delay: index * 0.03, ease: "easeOut" },
    }),
  };

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
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Confirmed Seats</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookingRows.map((row, index) => (
                <motion.tr key={row.id} className="text-slate-700" variants={rowVariants} initial="hidden" animate="show" custom={index}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                  <td className="px-4 py-3 capitalize">{row.status}</td>
                  <td className="px-4 py-3">{row.confirmedSeats}</td>
                  <td className="px-4 py-3">{row.maxAttendees}</td>
                  <td className="px-4 py-3">{formatDashboardDate(row.startTime)}</td>
                </motion.tr>
              ))}
              {bookingRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No booking data available.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </motion.div>
      ) : null}
    </div>
  );
}
