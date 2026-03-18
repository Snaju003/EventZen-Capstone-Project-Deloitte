import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "@/lib/auth-api";
import { useAuth } from "@/hooks/useAuth";

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function AdminVendors() {
  const { loadPendingVendorRequests, approveVendorRequest } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApprovingId, setIsApprovingId] = useState("");
  const hasLoadedOnceRef = useRef(false);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const pendingRequests = await loadPendingVendorRequests();
      setRequests(Array.isArray(pendingRequests) ? pendingRequests : []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load vendor role requests."));
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadPendingVendorRequests]);

  useEffect(() => {
    if (hasLoadedOnceRef.current) return;
    hasLoadedOnceRef.current = true;
    loadRequests();
  }, [loadRequests]);

  const approveRequest = async (userId) => {
    setIsApprovingId(userId);
    try {
      const result = await approveVendorRequest(userId);
      toast.success(result?.message || "Vendor role approved.");
      await loadRequests();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to approve vendor role request."));
    } finally {
      setIsApprovingId("");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Vendor Role Requests</h1>
          <p className="mt-1 text-slate-500">Approve customers who requested vendor access.</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">Loading requests...</div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Current Role</th>
                    <th className="px-4 py-3">Requested At</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{request.name || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{request.email || "-"}</td>
                      <td className="px-4 py-3 text-slate-700 capitalize">{request.role || "customer"}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(request.vendorRoleRequestedAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => approveRequest(request.id)}
                          disabled={isApprovingId === request.id}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isApprovingId === request.id ? "Approving..." : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No pending vendor role requests.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
