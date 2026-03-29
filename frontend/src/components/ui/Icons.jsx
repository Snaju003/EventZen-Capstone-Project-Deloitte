import {
  Check,
  Circle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

export const MailIcon = () => <Mail className="w-4 h-4" aria-hidden="true" />;

export const LockIcon = () => <Lock className="w-4 h-4" aria-hidden="true" />;

export const UserIcon = () => <User className="w-4 h-4" aria-hidden="true" />;

export const EyeOnIcon = () => <Eye className="w-4 h-4" aria-hidden="true" />;

export const EyeOffIcon = () => <EyeOff className="w-4 h-4" aria-hidden="true" />;

export const CheckIcon = () => <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeWidth={2.5} />;

export const CircleIcon = () => <Circle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;

export const LogoIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
  </svg>
);
