import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Receipt } from "lucide-react";
import { motion } from "framer-motion";

import AnimatedCounter from "@/components/common/AnimatedCounter";
import { getConvenienceFeeRevenueSummary } from "@/lib/payments-api";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ConvenienceFeeRevenueCard({ isAdmin }) {
  const [revenueData, setRevenueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    async function loadRevenueData() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getConvenienceFeeRevenueSummary();
        setRevenueData(data);
      } catch (loadError) {
        setError("Unable to load revenue data");
        console.error("Revenue load error:", loadError);
      } finally {
        setIsLoading(false);
      }
    }

    loadRevenueData();
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.32, ease: "easeOut" }}
      className="col-span-full rounded-2xl border border-white/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-[0_8px_32px_-12px_rgba(16,185,129,0.2)]"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Convenience Fee Revenue</h3>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white/60 p-4">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-2 h-7 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <motion.div
            className="rounded-xl bg-white/80 p-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.02, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" />
              Total Revenue
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {formatCurrency(revenueData?.totalRevenue || 0)}
            </p>
          </motion.div>

          <motion.div
            className="rounded-xl bg-white/80 p-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Receipt className="h-3.5 w-3.5" />
              Total Transactions
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              <AnimatedCounter end={revenueData?.totalTransactions || 0} duration={1} delay={0.4} />
            </p>
          </motion.div>

          <motion.div
            className="rounded-xl bg-white/80 p-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.14, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <DollarSign className="h-3.5 w-3.5" />
              Avg. Fee / Transaction
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {formatCurrency(revenueData?.averageFeePerTransaction || 0)}
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
