import { useRef } from 'react';
import { Camera, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function ProfileHeroCard({ user, onAvatarChange, isLoading, statLabel, statValue, showStat }) {
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onAvatarChange?.(file);
        }
        e.target.value = '';
    };

    const triggerFilePicker = () => fileInputRef.current?.click();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
            {/* Avatar */}
            <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="relative">
                    <UserAvatar name={user?.name} avatar={user?.avatar} size="lg" className="border-2 border-white shadow-md ring-2 ring-primary/10" />
                    <motion.button
                        onClick={triggerFilePicker}
                        disabled={isLoading}
                        className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary p-1.5 text-white shadow-lg transition-colors hover:opacity-90 disabled:opacity-60"
                        whileTap={{ scale: 0.92 }}
                    >
                        <Camera className="h-3 w-3" />
                    </motion.button>
                </div>
                <motion.button
                    onClick={triggerFilePicker}
                    disabled={isLoading}
                    className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 transition-colors hover:text-primary disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                >
                    <Pencil className="h-2.5 w-2.5" />
                    {isLoading ? 'Uploading…' : 'Edit'}
                </motion.button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900">{user?.name ?? '—'}</h2>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">{user?.role?.toUpperCase() ?? 'CUSTOMER'}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email || 'No email available'}</p>
            </div>

            {/* Stat */}
            {showStat ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                    className="shrink-0 flex flex-col items-center gap-0.5 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/80 px-4 py-2.5 text-center"
                >
                    <p className="text-2xl font-bold text-slate-800">{statValue ?? 0}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{statLabel}</p>
                </motion.div>
            ) : null}
        </motion.div>
    );
}
