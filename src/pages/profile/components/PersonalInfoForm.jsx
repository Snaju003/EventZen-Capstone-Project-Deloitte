import { useEffect, useState } from 'react';
import { IdCard } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/auth-api';
import toast from 'react-hot-toast';

export function PersonalInfoForm({ user, isLoading, onSubmit }) {
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');

    useEffect(() => {
        setName(user?.name ?? '');
        setEmail(user?.email ?? '');
    }, [user?.email, user?.name]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {};

        if (name.trim() && name.trim() !== (user?.name ?? '')) {
            payload.name = name.trim();
        }

        if (email.trim() && email.trim().toLowerCase() !== (user?.email ?? '').toLowerCase()) {
            payload.email = email.trim().toLowerCase();
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

    return (
        <div className="p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8">
                <IdCard className="text-primary w-6 h-6" />
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:opacity-90 disabled:opacity-60 text-white px-8 h-12 rounded-lg font-bold transition-all shadow-sm active:scale-95"
                    >
                        {isLoading ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
