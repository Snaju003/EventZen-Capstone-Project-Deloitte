import { useRef } from 'react';
import { Camera, Pencil, Calendar } from 'lucide-react';

export function ProfileHeroCard({ user, onAvatarChange, isLoading, statLabel, statValue, showStat }) {
    const fileInputRef = useRef(null);

    const memberSince = user?.created_at
        ? `Member since ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        : 'Member';

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onAvatarChange?.(file);
        }
        e.target.value = '';
    };

    const triggerFilePicker = () => fileInputRef.current?.click();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">

                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div
                            className="bg-slate-100 bg-center bg-no-repeat bg-cover rounded-full w-32 h-32 border-4 border-white shadow-md"
                            style={user?.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
                        />
                        <button
                            onClick={triggerFilePicker}
                            disabled={isLoading}
                            className="absolute bottom-0 right-0 bg-primary hover:opacity-90 disabled:opacity-60 text-white p-2 rounded-full shadow-lg transition-colors"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={triggerFilePicker}
                        disabled={isLoading}
                        className="text-xs font-semibold text-slate-700 hover:text-primary disabled:opacity-60 flex items-center gap-1 transition-colors"
                    >
                        <Pencil className="w-3 h-3" />
                        {isLoading ? 'Uploading…' : 'Change Profile Picture'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user?.name ?? '—'}</h1>
                    <p className="text-primary font-semibold mt-1">{user?.role?.toUpperCase() ?? 'Customer'}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{memberSince}</span>
                    </div>
                </div>

                {showStat ? (
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-40 flex flex-col gap-1 rounded-lg bg-slate-50 p-4 border border-slate-100 items-center text-center">
                            <p className="text-slate-800 text-3xl font-bold">{statValue ?? 0}</p>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{statLabel}</p>
                        </div>
                    </div>
                ) : null}

            </div>
        </div>
    );
}
