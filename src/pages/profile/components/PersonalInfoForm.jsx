import { useEffect, useState } from 'react';
import { IdCard } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/auth-api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { EmailOtpDialog } from './EmailOtpDialog';

export function PersonalInfoForm({ user, isLoading, onSubmit, onRequestEmailChangeOtp, onVerifyEmailChangeOtp }) {
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [emailOtp, setEmailOtp] = useState('');
    const [otpRequestedForEmail, setOtpRequestedForEmail] = useState('');
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [resendAvailableAt, setResendAvailableAt] = useState(0);
    const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

    useEffect(() => {
        setName(user?.name ?? '');
        setEmail(user?.email ?? '');
        setEmailOtp('');
        setOtpRequestedForEmail('');
        setIsOtpDialogOpen(false);
        setResendAvailableAt(0);
        setResendSecondsLeft(0);
    }, [user?.email, user?.name]);

    useEffect(() => {
        if (!resendAvailableAt) {
            setResendSecondsLeft(0);
            return undefined;
        }

        const updateCountdown = () => {
            const seconds = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
            setResendSecondsLeft(seconds);
        };

        updateCountdown();
        const intervalId = window.setInterval(updateCountdown, 1000);

        return () => window.clearInterval(intervalId);
    }, [resendAvailableAt]);

    const normalizedCurrentEmail = (user?.email ?? '').trim().toLowerCase();
    const normalizedEmailInput = email.trim().toLowerCase();
    const normalizedNameInput = name.trim();
    const isEmailChanged = normalizedEmailInput && normalizedEmailInput !== normalizedCurrentEmail;
    const otpMatchesCurrentEmail = otpRequestedForEmail && otpRequestedForEmail === normalizedEmailInput;
    const isNameChanged = normalizedNameInput && normalizedNameInput !== (user?.name ?? '');
    const hasPendingChanges = Boolean(isNameChanged || isEmailChanged);

    const startResendCountdown = (seconds) => {
        const safeSeconds = Math.max(0, Number(seconds) || 0);
        setResendAvailableAt(safeSeconds > 0 ? Date.now() + safeSeconds * 1000 : 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {};

        if (normalizedNameInput && normalizedNameInput !== (user?.name ?? '')) {
            payload.name = normalizedNameInput;
        }

        if (Object.keys(payload).length === 0) {
            toast('No changes to save.', { id: 'profile-update' });
            return;
        }

        try {
            const result = await onSubmit(payload);
            toast.success(result?.message || 'Your profile has been updated.', { id: 'profile-update' });
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to update profile. Please try again.'), { id: 'profile-update-error' });
        }
    };

    const handleResetChanges = () => {
        setName(user?.name ?? '');
        setEmail(user?.email ?? '');
        setEmailOtp('');
        setOtpRequestedForEmail('');
        setResendAvailableAt(0);
        setResendSecondsLeft(0);
        setIsOtpDialogOpen(false);
    };

    const handleRequestEmailOtp = async () => {
        if (!isEmailChanged) {
            toast('Enter a different email address first.', { id: 'email-change-hint' });
            return;
        }

        try {
            const result = await onRequestEmailChangeOtp(normalizedEmailInput);
            setOtpRequestedForEmail(normalizedEmailInput);
            setEmailOtp('');
            setIsOtpDialogOpen(true);
            startResendCountdown(result?.retryAfterSeconds || 60);
            toast.success(result?.message || 'OTP sent to your new email address.', { id: 'email-change-request' });
        } catch (error) {
            const retryAfterSeconds = Number(error?.response?.data?.retryAfterSeconds || 0);
            if (retryAfterSeconds > 0) {
                startResendCountdown(retryAfterSeconds);
            }
            toast.error(getApiErrorMessage(error, 'Failed to send email verification code.'), { id: 'email-change-request-error' });
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (!otpMatchesCurrentEmail) {
            toast.error('Request a code for this email before verifying.', { id: 'email-change-verify-error' });
            return;
        }

        if (!/^\d{6}$/.test(emailOtp.trim())) {
            toast.error('Enter the 6-digit OTP sent to your new email.', { id: 'email-change-verify-format' });
            return;
        }

        try {
            const result = await onVerifyEmailChangeOtp(emailOtp.trim());
            setOtpRequestedForEmail('');
            setEmailOtp('');
            setIsOtpDialogOpen(false);
            toast.success(result?.message || 'Email updated successfully.', { id: 'email-change-verify' });
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to verify OTP for email change.'), { id: 'email-change-verify-error' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex w-full flex-1 flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IdCard className="h-4 w-4" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">Personal Profile</h2>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Identity details</p>
                </div>
                </div>
                {hasPendingChanges ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Unsaved
                    </span>
                ) : null}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
                <div className="interactive-field flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div className="interactive-field flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            const nextEmail = e.target.value;
                            setEmail(nextEmail);

                            const normalizedNext = nextEmail.trim().toLowerCase();
                            if (!normalizedNext || normalizedNext !== otpRequestedForEmail) {
                                setEmailOtp('');
                            }
                        }}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-slate-500">
                        Email change requires OTP verification.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <motion.button
                                type="button"
                                onClick={handleRequestEmailOtp}
                                disabled={isLoading || !isEmailChanged || (otpMatchesCurrentEmail && resendSecondsLeft > 0)}
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                whileTap={{ scale: 0.97 }}
                            >
                                {otpMatchesCurrentEmail && resendSecondsLeft > 0
                                    ? `Resend in ${resendSecondsLeft}s`
                                    : otpMatchesCurrentEmail
                                        ? 'Resend OTP'
                                        : 'Send OTP'}
                            </motion.button>
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <motion.button
                        type="button"
                        onClick={handleResetChanges}
                        disabled={isLoading || !hasPendingChanges}
                        className="mr-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        whileTap={{ scale: 0.98 }}
                    >
                        Reset
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isLoading || !isNameChanged}
                        className="h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 active:scale-95"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ y: -1 }}
                    >
                        {isLoading ? 'Saving…' : 'Save Changes'}
                    </motion.button>
                </div>
            </form>

            <EmailOtpDialog
                emailOtp={emailOtp}
                isEmailChanged={isEmailChanged}
                isLoading={isLoading}
                isOpen={isOtpDialogOpen}
                normalizedEmailInput={normalizedEmailInput}
                onChangeOpen={(nextOpen) => {
                    setIsOtpDialogOpen(nextOpen);
                    if (!nextOpen) {
                        setEmailOtp('');
                    }
                }}
                onOtpChange={setEmailOtp}
                onRequestOtp={handleRequestEmailOtp}
                onVerifyOtp={handleVerifyEmailOtp}
                otpMatchesCurrentEmail={otpMatchesCurrentEmail}
                otpRequestedForEmail={otpRequestedForEmail}
                resendSecondsLeft={resendSecondsLeft}
            />
        </motion.div>
    );
}
