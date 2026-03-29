import { formatINR } from "@/lib/currency";
import { BudgetEmptyIcon } from "@/pages/admin/components/budget/BudgetIcons";
import { toCurrencyNumber } from "@/pages/admin/components/budget/adminBudget.constants";

export function VendorAssignmentsCard({
  getResolvedVendorLabel,
  getVendorServiceType,
  vendorAssignments,
  vendorCommitted,
}) {
  return (
    <div className="surface-card surface-card-hover p-5">
      <h2 className="mb-3 text-lg font-bold text-slate-900">Assigned Vendors</h2>

      {vendorAssignments.length === 0 ? (
        <div className="py-6 text-center">
          <BudgetEmptyIcon />
          <p className="mt-2 text-sm text-slate-500">No vendors assigned to this event.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vendorAssignments.map((assignment, index) => {
            const serviceType = getVendorServiceType(assignment);
            const label = getResolvedVendorLabel(assignment, index);

            return (
              <div
                key={`${assignment?.vendorId || assignment?.id || index}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm transition-colors hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {label.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <span className="font-medium text-slate-800">{label}</span>
                    {serviceType ? (
                      <span className="ml-2 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                        {serviceType}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="font-semibold text-slate-900">{formatINR(toCurrencyNumber(assignment?.agreedCost))}</span>
              </div>
            );
          })}

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
            <span>Total Vendor Commitments</span>
            <span>{formatINR(vendorCommitted)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
