export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function toDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDate(value) {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;

  return {
    year: Number(parts[0]),
    month: Number(parts[1]) - 1,
    day: Number(parts[2]),
  };
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

export function formatDisplayDate(value) {
  if (!value) return "";
  const parsed = parseDate(value);
  if (!parsed) return value;

  const date = new Date(parsed.year, parsed.month, parsed.day);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
