import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { ProfileHeroCard } from './components/ProfileHeroCard';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { getMyBookings } from '@/lib/bookings-api';
import { getEvents } from '@/lib/events-api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, isLoading, updateMe, uploadAvatar, logout, fetchMe, requestVendorAccess } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const statusMessage = location.state?.statusMessage;
    const hasHydratedUser = useRef(false);
    const [roleMetricCount, setRoleMetricCount] = useState(0);

    useEffect(() => {
        if (user || hasHydratedUser.current) return;

        hasHydratedUser.current = true;
        fetchMe().catch(() => {
            // ProtectedRoute handles unauthenticated state; silently ignore here.
        });
    }, [fetchMe, user]);

    useEffect(() => {
        if (statusMessage) {
            toast.success(statusMessage, { id: "profile-status" });
        }
    }, [statusMessage]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('You have been signed out successfully.', { id: 'auth-status' });
        } finally {
            navigate('/', { replace: true });
        }
    };

    const vendorRoleStatus = (user?.vendorRoleStatus || 'none').toLowerCase();
    const canRequestVendorRole = (user?.role || '').toLowerCase() === 'customer' && vendorRoleStatus !== 'pending';
    const normalizedRole = (user?.role || '').toLowerCase();
    const showVendorAccessSection = normalizedRole !== 'admin';

    useEffect(() => {
        let active = true;

        const loadRoleMetric = async () => {
            if (!user?.id) {
                if (active) setRoleMetricCount(0);
                return;
            }

            try {
                if (normalizedRole === 'customer') {
                    const bookings = await getMyBookings();
                    if (active) setRoleMetricCount(Array.isArray(bookings) ? bookings.length : 0);
                    return;
                }

                if (normalizedRole === 'vendor') {
                    const events = await getEvents();
                    const ownEvents = Array.isArray(events)
                        ? events.filter((event) => event?.createdBy === user.id)
                        : [];
                    if (active) setRoleMetricCount(ownEvents.length);
                    return;
                }

                if (active) setRoleMetricCount(0);
            } catch {
                if (active) setRoleMetricCount(0);
            }
        };

        loadRoleMetric();

        return () => {
            active = false;
        };
    }, [normalizedRole, user?.id]);

    const profileStat = useMemo(() => {
        if (normalizedRole === 'customer') {
            return { label: 'Total Bookings', show: true };
        }

        if (normalizedRole === 'vendor') {
            return { label: 'Total Events', show: true };
        }

        return { label: '', show: false };
    }, [normalizedRole]);

    const handleVendorRoleRequest = async () => {
        try {
            const result = await requestVendorAccess();
            toast.success(result?.message || 'Vendor role request submitted.', { id: 'vendor-role-request' });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Unable to submit vendor role request.', { id: 'vendor-role-request-error' });
        }
    };

    const handleProfileUpdate = (values) => updateMe(values);

    const handlePasswordUpdate = (values) => updateMe(values);

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
                <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">

                    <ProfileHeroCard
                        user={user}
                        isLoading={isLoading}
                        onAvatarChange={uploadAvatar}
                        showStat={profileStat.show}
                        statLabel={profileStat.label}
                        statValue={roleMetricCount}
                    />

                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <PersonalInfoForm user={user} isLoading={isLoading} onSubmit={handleProfileUpdate} />
                        <ChangePasswordForm isLoading={isLoading} onSubmit={handlePasswordUpdate} />
                    </section>

                    {showVendorAccessSection ? (
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900">Vendor Access</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Request vendor role to create, publish, and cancel events, and manage event budgets.
                            </p>
                            <p className="mt-3 text-sm text-slate-700">
                                Current request status: <span className="font-semibold uppercase">{vendorRoleStatus}</span>
                            </p>
                            <button
                                type="button"
                                onClick={handleVendorRoleRequest}
                                disabled={!canRequestVendorRole || isLoading}
                                className="mt-4 h-11 rounded-lg bg-primary px-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {vendorRoleStatus === 'pending' ? 'Request Pending Approval' : 'Request Vendor Role'}
                            </button>
                        </section>
                    ) : null}

                    <section className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 w-full py-4 text-red-700 hover:bg-red-100 disabled:opacity-60 rounded-lg transition-colors font-semibold"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Profile;
