export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function pad(value) {
  return String(value).padStart(2, "0");
}

export function toLocalDatetimeString(date) {
  if (!date) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDatetime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function generateTimeSlots() {
  const slots = [];
  for (let hours = 0; hours < 24; hours += 1) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const hour12 = hours % 12 === 0 ? 12 : hours % 12;
      const ampm = hours < 12 ? "AM" : "PM";

      slots.push({
        label: `${hour12}:${pad(minutes)} ${ampm}`,
        h: hours,
        m: minutes,
        value: `${pad(hours)}:${pad(minutes)}`,
      });
    }
  }

  return slots;
}

export const TIME_SLOTS = generateTimeSlots();
