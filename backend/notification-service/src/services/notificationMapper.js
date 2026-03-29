const { getBookedUserIdsForEvent, getUserIdsByRoles } = require("./recipientResolver");

const HANDLED_TOPICS = [
  "booking.confirmed",
  "booking.cancelled",
  "booking.admin-cancelled",
  "booking.checked-in",
  "event.published",
  "event.cancelled",
  "event.vendor-assigned",
  "event.vendor-confirmed",
  "event.vendor-declined",
  "payment.success",
  "payment.failed",
  "user.vendor-request",
  "user.vendor-approved",
];

function asArrayUnique(items) {
  return [...new Set((items || []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function timeFromMessage(message) {
  const timestamp = message?.timestamp;
  const date = timestamp ? new Date(timestamp) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function buildBaseMetadata(payload) {
  return {
    eventId: payload?.eventId,
    bookingId: payload?.bookingId,
    eventTitle: payload?.eventTitle,
  };
}

function formatRupeeAmount(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) {
    return "0";
  }

  return parsed.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(parsed) ? 0 : 2,
  });
}

async function mapKafkaMessageToNotifications(eventType, payload, timestamp) {
  const createdAt = timeFromMessage({ timestamp });
  const metadata = {
    ...buildBaseMetadata(payload),
    ...((payload && typeof payload === "object") ? payload : {}),
  };

  switch (eventType) {
    case "booking.confirmed":
      return {
        userIds: asArrayUnique([payload?.userId]),
        title: "Booking Confirmed",
        message: `Your booking for ${payload?.eventTitle || "your event"} is confirmed`,
        metadata,
        createdAt,
      };
    case "booking.cancelled":
      return {
        userIds: asArrayUnique([payload?.userId]),
        title: "Booking Cancelled",
        message: `Your booking for ${payload?.eventTitle || "your event"} has been cancelled`,
        metadata,
        createdAt,
      };
    case "booking.admin-cancelled":
      return {
        userIds: asArrayUnique([payload?.userId]),
        title: "Booking Cancelled by Organizer",
        message: `Your booking for ${payload?.eventTitle || "your event"} has been cancelled by the organizer`,
        metadata,
        createdAt,
      };
    case "booking.checked-in":
      return {
        userIds: asArrayUnique([payload?.userId]),
        title: "Checked In",
        message: `You've been checked in to ${payload?.eventTitle || "your event"}`,
        metadata,
        createdAt,
      };
    case "event.published": {
      const adminAndVendorIds = await getUserIdsByRoles(["admin", "vendor"]);
      return {
        userIds: adminAndVendorIds,
        title: "New Event Published",
        message: `New event: ${payload?.eventTitle || "Untitled event"} is now open for registration!`,
        metadata,
        createdAt,
      };
    }
    case "event.cancelled": {
      const recipientUserIds = await getBookedUserIdsForEvent(payload?.eventId);
      return {
        userIds: recipientUserIds,
        title: "Event Cancelled",
        message: `Event ${payload?.eventTitle || "your event"} has been cancelled`,
        metadata,
        createdAt,
      };
    }
    case "event.vendor-assigned":
      return {
        userIds: asArrayUnique([payload?.vendorUserId, payload?.userId]),
        title: "Vendor Assignment",
        message: `You've been assigned to event ${payload?.eventTitle || "an event"}. Please confirm.`,
        metadata,
        createdAt,
      };
    case "event.vendor-confirmed":
      return {
        userIds: asArrayUnique([payload?.adminUserId, payload?.userId]),
        title: "Vendor Confirmed",
        message: `Vendor ${payload?.vendorName || "Vendor"} confirmed for ${payload?.eventTitle || "the event"}`,
        metadata,
        createdAt,
      };
    case "event.vendor-declined":
      return {
        userIds: asArrayUnique([payload?.adminUserId, payload?.userId]),
        title: "Vendor Declined",
        message: `Vendor ${payload?.vendorName || "Vendor"} declined ${payload?.eventTitle || "the event"}. Please reassign.`,
        metadata,
        createdAt,
      };
    case "payment.success":
      return {
        userIds: asArrayUnique([payload?.userId]),
        title: "Payment Success",
        message: `Payment of INR ${formatRupeeAmount(payload?.amount)} for ${payload?.eventTitle || "your event"} received successfully`,
        metadata,
        createdAt,
      };
    case "payment.failed":
      return {
        userIds: asArrayUnique([payload?.userId]),
        title: "Payment Failed",
        message: `Payment for ${payload?.eventTitle || "your event"} could not be processed`,
        metadata,
        createdAt,
      };
    case "user.vendor-request": {
      const adminUserIds = await getUserIdsByRoles(["admin"]);
      return {
        userIds: adminUserIds,
        title: "Vendor Access Request",
        message: `User ${payload?.userName || "A user"} has requested vendor access`,
        metadata,
        createdAt,
      };
    }
    case "user.vendor-approved":
      return {
        userIds: asArrayUnique([payload?.userId]),
        title: "Vendor Access Approved",
        message: "Your vendor access request has been approved!",
        metadata,
        createdAt,
      };
    default:
      return null;
  }
}

module.exports = {
  HANDLED_TOPICS,
  mapKafkaMessageToNotifications,
};
