export const initialEventForm = {
  title: "",
  description: "",
  venueId: "",
  startTime: "",
  endTime: "",
  ticketTypes: [{ id: crypto.randomUUID(), name: "General Admission", description: "", price: "", maxQuantity: "" }],
  imageUrls: [],
  vendorId: "",
  agreedCost: "",
  totalBudget: "",
};

export const emptyPageMeta = {
  page: 1,
  size: 9,
  total: 0,
  totalPages: 0,
  hasNext: false,
};

export const emptyEventCounts = {
  all: 0,
  pending: 0,
  published: 0,
  rejected: 0,
  cancelled: 0,
};

export function createDefaultRejectionDialogState() {
  return {
    open: false,
    eventId: "",
    eventTitle: "",
    reason: "Please update event details and resubmit.",
  };
}

export function createDefaultPublishDialogState() {
  return {
    open: false,
    eventId: "",
    eventTitle: "",
    totalBudget: "",
  };
}

export function toDateTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function formatDateTime(value) {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
