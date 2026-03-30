import { useState } from "react";
import { BadgeCheck, Clock, ShieldCheck, Store } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";

/**
 * Shows:
 *  - "Request Vendor Access" button  → when vendorRoleStatus is "none"
 *  - "Pending approval" badge        → when vendorRoleStatus is "pending"
 *  - Nothing (hidden)                → when user is already a vendor/admin or approved
 */
export function BecomeVendorCard({ user, onStatusChange }) {
  const { requestVendorAccess, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const status = user?.vendorRoleStatus || "none";
  const role = String(user?.role || "").toLowerCase();

  // Don't show for admins or users who are already vendors
  if (role === "admin" || role === "vendor" || status === "approved") return null;

  const isPending = status === "pending";

  const handleRequest = async () => {
    setIsSubmitting(true);
    try {
      const result = await requestVendorAccess();
      toast.success(result?.message || "Vendor role request submitted!");
      onStatusChange?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to submit request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex w-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Become a Vendor</h3>
          <p className="text-[11px] text-slate-500">Expand your role on EventZen</p>
        </div>
      </div>

      {/* Description */}
      <p className="mb-5 text-sm leading-relaxed text-slate-600">
        As a vendor, you can manage event assignments, scan QR codes for attendee check-in, and track your event budgets.
      </p>

      {/* Benefits */}
      <div className="mb-5 space-y-2.5">
        {[
          { icon: ShieldCheck, text: "Accept or decline event assignments" },
          { icon: BadgeCheck, text: "Scan QR codes for attendee check-in" },
          { icon: Store, text: "Track agreed costs and budgets" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50">
              <item.icon className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <span className="text-xs text-slate-600">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="mt-auto">
        {isPending ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Clock className="h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Request Pending</p>
              <p className="text-[11px] text-amber-600">Your vendor role request is awaiting admin approval.</p>
            </div>
          </div>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                disabled={isLoading || isSubmitting}
              >
                <Store className="h-4 w-4" />
                Request Vendor Access
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Request Vendor Role?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will send a request to the platform administrators. Once approved, your account 
                  will be upgraded to a vendor role with access to event assignments, QR check-in, and budget tracking.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRequest}
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Confirm Request"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </motion.div>
  );
}
