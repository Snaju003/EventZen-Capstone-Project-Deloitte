export const categories = ["Venue", "Catering", "AV", "Marketing", "Staffing", "Miscellaneous"];

export const categoryOptions = categories.map((category) => ({
  value: category,
  label: category,
}));

export const chartPalette = ["#0f766e", "#1d4ed8", "#16a34a", "#dc2626", "#7c3aed", "#f97316"];

export const categoryColors = {
  Venue: "#0f766e",
  Catering: "#1d4ed8",
  AV: "#16a34a",
  Marketing: "#dc2626",
  Staffing: "#7c3aed",
  Miscellaneous: "#f97316",
};

export function toCurrencyNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toPercent(value, total) {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

export function buildConicGradient(segments, total) {
  if (!segments.length || total <= 0) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let currentPercent = 0;
  const stops = segments.map((segment) => {
    const segmentPercent = toPercent(segment.value, total);
    const start = currentPercent;
    const end = Math.min(100, currentPercent + segmentPercent);
    currentPercent = end;
    return `${segment.color} ${start}% ${end}%`;
  });

  if (currentPercent < 100) {
    stops.push(`#e2e8f0 ${currentPercent}% 100%`);
  }

  return `conic-gradient(${stops.join(", ")})`;
}

export function formatExpenseDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
