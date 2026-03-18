import { useState } from 'react';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/auth-api';

export function ChangePasswordForm({ isLoading, onSubmit }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
        <div className="border-t border-slate-200 p-6 md:p-10 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-8">
                <Lock className="text-emerald-500 w-6 h-6" />
                <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <p className="md:col-span-2 text-xs text-slate-500">
                    Use at least 8 characters with uppercase, lowercase, and a number or special character.
                </p>

                <div className="flex justify-end md:col-span-2 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white px-8 h-12 rounded-lg font-bold transition-all shadow-sm active:scale-95"
                    >
                        {isLoading ? 'Saving…' : 'Save Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}
