import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/auth-api';

export function ChangePasswordForm({ isLoading, onSubmit }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('All password fields are required.', { id: 'profile-password-error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirmation do not match.', { id: 'profile-password-error' });
            return;
        }

        try {
            const result = await onSubmit({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success(result?.message || 'Password updated successfully.', { id: 'profile-password-success' });
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to update password right now.'), { id: 'profile-password-error' });
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Lock className="h-4 w-4" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">Password</h2>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Security settings</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="interactive-field flex flex-col gap-2 md:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Current Password</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            placeholder="••••••••"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword((previous) => !previous)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="interactive-field flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">New Password</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="••••••••"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword((previous) => !previous)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="interactive-field flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Confirm New Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="••••••••"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((previous) => !previous)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-1 md:col-span-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 active:scale-95"
                    >
                        {isLoading ? 'Saving…' : 'Save Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}
