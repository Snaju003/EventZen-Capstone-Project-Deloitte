export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

export function getRoleHomePath(role) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "admin" || normalizedRole === "vendor"
    ? "/admin/dashboard"
    : "/events";
}
