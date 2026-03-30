/**
 * UserAvatar — renders a user's avatar image or a gradient initial-letter
 * fallback when no avatar URL is available.
 *
 * Usage:
 *   <UserAvatar name="John" avatar={user.avatar} size="md" />
 */

const GRADIENT_PALETTES = [
  "from-violet-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-cyan-600",
  "from-fuchsia-500 to-purple-600",
  "from-lime-500 to-green-600",
];

const SIZE_MAP = {
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-16 w-16 text-xl",
  xl: "h-20 w-20 text-2xl",
};

function getInitial(name) {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() || "?";
}

function getGradient(name) {
  if (!name) return GRADIENT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length];
}

export function UserAvatar({ name, avatar, size = "sm", className = "" }) {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.sm;

  if (avatar) {
    return (
      <div
        className={`shrink-0 rounded-full bg-cover bg-center bg-no-repeat ${sizeClasses} ${className}`}
        style={{ backgroundImage: `url("${avatar}")` }}
        role="img"
        aria-label={`${name || "User"}'s avatar`}
      />
    );
  }

  const initial = getInitial(name);
  const gradient = getGradient(name);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-inner ${gradient} ${sizeClasses} ${className}`}
      role="img"
      aria-label={`${name || "User"}'s avatar`}
    >
      {initial}
    </div>
  );
}
