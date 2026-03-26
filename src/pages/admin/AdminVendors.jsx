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
        if (!userId || isApprovingId) {
            return;
        }

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
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
            <div className="soft-orb left-[-4rem] top-20 h-44 w-44 bg-sky-300/20" />
            <div className="soft-orb right-[-3rem] top-32 h-40 w-40 bg-cyan-200/25" style={{ animationDelay: '1.1s' }} />
            <main className="page-shell flex-1">
                <div className="animate-rise mb-6">
                    <p className="section-kicker">Role Approval Queue</p>
                    <h1 className="section-title">Vendor Role Requests</h1>
                    <p className="mt-1 text-slate-600">Approve customers who requested vendor access.</p>
                </div>

                <section className="animate-rise delay-1 mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-7 text-slate-100 shadow-[0_24px_64px_-34px_rgba(15,23,42,0.6)] sm:px-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Access Governance</p>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Review and approve vendor role upgrades to keep creation permissions secure and intentional.</p>
                </section>

                {isLoading ? (
                    <div className="surface-card p-6 text-center text-slate-600">Loading requests...</div>
                ) : (
                    <div className="surface-card animate-rise delay-2">
                        <div className="overflow-x-auto">
                            <table className="data-table">
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
                                                    disabled={Boolean(isApprovingId)}
                                                    className="button-polish focus-polish rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
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
