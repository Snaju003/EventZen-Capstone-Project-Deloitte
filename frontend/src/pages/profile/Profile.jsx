import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

import { ProfileHeroCard } from './components/ProfileHeroCard';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { BecomeVendorCard } from './components/BecomeVendorCard';
import { authApi, getMessage } from '@/lib/auth-api';
import { getMyBookings } from '@/lib/bookings-api';
import { getEvents } from '@/lib/events-api';
import { useAuth } from '@/hooks/useAuth';
import { staggerContainer, fadeUp } from '@/lib/animations';

export default function Profile() {
    const navigate = useNavigate();
    const { user: authUser, fetchMe, updateMe, uploadAvatar: contextUploadAvatar, requestEmailChangeOtp, verifyEmailChangeOtp, logout } = useAuth();
    const [user, setUser] = useState(authUser);
    const [bookingCount, setBookingCount] = useState(0);
    const [vendorEventCount, setVendorEventCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profileData = await fetchMe();
            const normalizedRole = String(profileData?.role || "").toLowerCase();

            let nextBookingCount = 0;
            let nextVendorEventCount = 0;

            if (normalizedRole === "customer") {
                const bookings = await getMyBookings().catch(() => []);
                nextBookingCount = Array.isArray(bookings) ? bookings.length : 0;
            }

            if (normalizedRole === "vendor") {
                const events = await getEvents().catch(() => []);
                nextVendorEventCount = Array.isArray(events)
                    ? events.filter((event) => !profileData?.id || event?.createdBy === profileData.id).length || events.length
                    : 0;
            }

            setUser(profileData);
            setBookingCount(nextBookingCount);
            setVendorEventCount(nextVendorEventCount);
        } catch {
            toast.error('Unable to load your profile right now.');
        } finally {
            setIsLoading(false);
        }
    }, [fetchMe]);

    const normalizedUserRole = String(user?.role || "").toLowerCase();
    const shouldShowProfileStat = normalizedUserRole !== "admin";
    const profileStatLabel = normalizedUserRole === "vendor" ? "My Events" : "My Bookings";
    const profileStatValue = normalizedUserRole === "vendor" ? vendorEventCount : bookingCount;

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleAvatarChange = async (file) => {
        setIsUploading(true);
        try {
            const result = await contextUploadAvatar(file);
            setUser(result?.user ?? user);
            toast.success(result?.message || 'Avatar updated');
        } catch {
            toast.error('Unable to update your profile picture.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async (payload) => {
        const result = await updateMe(payload);
        setUser(result?.user ?? user);
        return result;
    };

    const handleChangePassword = async (payload) => {
        const response = await authApi.put('/me/password', payload);
        return { message: getMessage(response) };
    };

    const handleRequestEmailOtp = async (email) => {
        return requestEmailChangeOtp(email);
    };

    const handleVerifyEmailOtp = async (otp) => {
        const result = await verifyEmailChangeOtp(otp);
        setUser(result?.user ?? user);
        return result;
    };

    const handleSignOut = async () => {
        await logout();
        // ProtectedRoute automatically redirects to /auth when auth state clears.
        // Do NOT add a manual navigate('/auth') here — the dual navigation corrupts
        // React Router's history state, breaking navigate() calls on the auth page
        // (e.g. the "Back to Home" button) until a full page reload.
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
            <div className="soft-orb left-[-5rem] top-24 h-44 w-44 bg-indigo-200/30" />
            <div className="soft-orb right-[-4rem] top-44 h-40 w-40 bg-amber-200/25" style={{ animationDelay: '1s' }} />
            <main className="page-shell flex flex-1 flex-col py-4">
                {/* Compact hero row: banner + identity side by side */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]"
                >
                    {/* Left: slim banner */}
                    <div className="flex flex-col justify-center rounded-2xl border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-5 py-4 text-slate-100 shadow-[0_16px_48px_-24px_rgba(15,23,42,0.5)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Account Settings</p>
                                <h1 className="mt-1 text-2xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>Profile</h1>
                                <p className="mt-1 max-w-lg text-xs text-slate-300">Manage your personal details, security, and account preferences.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur transition-all hover:bg-red-500/90 hover:text-white hover:border-red-500"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Right: compact identity card */}
                    <ProfileHeroCard
                        user={user}
                        onAvatarChange={handleAvatarChange}
                        isLoading={isUploading}
                        showStat={shouldShowProfileStat}
                        statLabel={profileStatLabel}
                        statValue={profileStatValue}
                    />
                </motion.div>

                {/* Two-column form layout */}
                <motion.div
                    className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2"
                    variants={staggerContainer(0.06, 0.08)}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={fadeUp} className="flex">
                        <PersonalInfoForm
                            user={user}
                            isLoading={isLoading}
                            onSubmit={handleUpdateProfile}
                            onRequestEmailChangeOtp={handleRequestEmailOtp}
                            onVerifyEmailChangeOtp={handleVerifyEmailOtp}
                        />
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex">
                        <ChangePasswordForm
                            isLoading={isLoading}
                            onSubmit={handleChangePassword}
                        />
                    </motion.div>

                    {/* Become a Vendor card — only visible for customers */}
                    {normalizedUserRole === 'customer' ? (
                        <motion.div variants={fadeUp} className="flex lg:col-span-2">
                            <BecomeVendorCard user={user} onStatusChange={loadProfile} />
                        </motion.div>
                    ) : null}
                </motion.div>
            </main>
        </div>
    );
}
