const { createHttpError } = require("../utils/httpError");
const { sanitizeSeatCount, readText } = require("../utils/paymentRequest");
const { hasText } = require("../utils/text");

const CONVENIENCE_FEE_PERCENT = Number(process.env.CONVENIENCE_FEE_PERCENT) || 0;

function buildOrderReceipt(eventId, userId) {
  const eventPart = (eventId || "evt").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "evt";
  const userPart = (userId || "usr").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "usr";
  const timestampPart = Date.now().toString(36);
  return `evtz_${eventPart}_${userPart}_${timestampPart}`.slice(0, 40);
}

async function createPaymentOrder({ user, body, currency, razorpayKeyId, fetchEventById, getRazorpayClient }) {
  if (user?.role !== "customer") {
    throw createHttpError(403, "Only customers can make payments for bookings");
  }

  const eventId = readText(body?.eventId);
  const seatCount = sanitizeSeatCount(body?.seatCount);
  const ticketTypeId = readText(body?.ticketTypeId);

  if (!hasText(eventId) || !seatCount) {
    throw createHttpError(400, "eventId and a valid seatCount are required");
  }

  const event = await fetchEventById(eventId);

  // Resolve ticket price from ticket types or fallback to flat ticketPrice
  let ticketPrice;
  let ticketTypeName = "";
  const ticketTypes = Array.isArray(event?.ticketTypes) ? event.ticketTypes : [];

  if (ticketTypeId && ticketTypes.length > 0) {
    const matchedType = ticketTypes.find((tt) => {
      const candidateId = readText(tt?.id || tt?._id || "");
      return candidateId === ticketTypeId;
    });
    if (!matchedType) {
      throw createHttpError(400, "Invalid ticket type selected");
    }
    ticketPrice = Number(matchedType.price);
    ticketTypeName = matchedType.name || "";
  } else {
    ticketPrice = Number(event?.ticketPrice);
  }

  if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
    throw createHttpError(400, "Event ticket price is invalid");
  }

  const baseAmount = ticketPrice * seatCount;
  const convenienceFee = baseAmount * (CONVENIENCE_FEE_PERCENT / 100);
  const totalAmount = baseAmount + convenienceFee;
  const amountInPaise = Math.round(totalAmount * 100);

  if (amountInPaise < 100) {
    throw createHttpError(400, "Minimum payable amount is INR 1");
  }

  const razorpay = getRazorpayClient();
  const receipt = buildOrderReceipt(eventId, user.id);
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency,
    receipt,
    notes: {
      eventId,
      userId: user.id,
      seatCount: String(seatCount),
      ticketPrice: String(ticketPrice),
      ticketTypeId: ticketTypeId || "",
      ticketTypeName: ticketTypeName || "",
      convenienceFee: String(convenienceFee),
      convenienceFeePercent: String(CONVENIENCE_FEE_PERCENT),
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    seatCount,
    eventId,
    eventTitle: event?.title || "Event",
    keyId: razorpayKeyId,
    ticketPrice,
    baseAmount,
    convenienceFee,
    convenienceFeePercent: CONVENIENCE_FEE_PERCENT,
    totalAmount,
  };
}

module.exports = {
  createPaymentOrder,
};
