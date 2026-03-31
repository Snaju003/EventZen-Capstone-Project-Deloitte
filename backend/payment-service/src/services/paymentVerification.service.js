const crypto = require("crypto");

const ConvenienceFeeRevenue = require("../models/ConvenienceFeeRevenue");
const { isDatabaseConnected } = require("../utils/database");
const { createHttpError } = require("../utils/httpError");
const { sanitizeSeatCount, readText } = require("../utils/paymentRequest");
const { hasText } = require("../utils/text");
const { fetchEventById } = require("./eventClient");
const { publishNotificationEvent } = require("../utils/kafkaProducer");

function assertPaymentSignature({ orderId, paymentId, signature, secret }) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const signaturesMatch =
    expectedSignature.length === signature.length
    && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

  if (!signaturesMatch) {
    throw createHttpError(400, "Payment signature verification failed");
  }
}

function readFirstText(values) {
  for (const value of values) {
    const normalized = readText(value);
    if (hasText(normalized)) {
      return normalized;
    }
  }

  return "";
}

async function recordConvenienceFeeRevenue({ eventId, seatCount, ticketPrice, convenienceFee }) {
  if (!isDatabaseConnected()) {
    console.warn("Database not connected. Skipping revenue tracking.");
    return;
  }

  const fee = Number(convenienceFee);
  if (!Number.isFinite(fee) || fee <= 0) {
    return;
  }

  try {
    await ConvenienceFeeRevenue.create({
      eventId,
      seatCount: Number(seatCount),
      ticketPrice: Number(ticketPrice),
      convenienceFee: fee,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to record convenience fee revenue:", error.message);
  }
}

async function verifyPayment({ user, body, razorpaySecret, getRazorpayClient }) {
  if (user?.role !== "customer") {
    throw createHttpError(403, "Only customers can verify booking payments");
  }

  const paymentPayload = typeof body?.payment === "object" && body?.payment !== null ? body.payment : {};
  const orderId = readFirstText([
    body?.razorpayOrderId,
    body?.razorpay_order_id,
    body?.orderId,
    paymentPayload?.razorpayOrderId,
    paymentPayload?.razorpay_order_id,
    paymentPayload?.orderId,
  ]);
  const paymentId = readFirstText([
    body?.razorpayPaymentId,
    body?.razorpay_payment_id,
    body?.paymentId,
    paymentPayload?.razorpayPaymentId,
    paymentPayload?.razorpay_payment_id,
    paymentPayload?.paymentId,
  ]);
  const signature = readFirstText([
    body?.razorpaySignature,
    body?.razorpay_signature,
    body?.signature,
    paymentPayload?.razorpaySignature,
    paymentPayload?.razorpay_signature,
    paymentPayload?.signature,
  ]);
  const eventId = readText(body?.eventId);
  const seatCount = sanitizeSeatCount(body?.seatCount);

  if (!hasText(orderId) || !hasText(paymentId) || !hasText(signature)) {
    throw createHttpError(400, "Payment verification fields are required");
  }

  if (!hasText(razorpaySecret)) {
    throw createHttpError(500, "RAZORPAY_KEY_SECRET is not configured");
  }

  try {
    const razorpay = getRazorpayClient();
    let paymentRecord = null;
    let signatureError = null;

    try {
      assertPaymentSignature({ orderId, paymentId, signature, secret: razorpaySecret });
    } catch (error) {
      signatureError = error;
    }

    if (signatureError) {
      paymentRecord = await razorpay.payments.fetch(paymentId).catch(() => null);
      const paymentBelongsToOrder = readText(paymentRecord?.order_id) === orderId;
      const paymentStatus = readText(paymentRecord?.status).toLowerCase();
      const paymentSettled = paymentStatus === "captured" || paymentStatus === "authorized";

      if (!paymentBelongsToOrder || !paymentSettled) {
        throw signatureError;
      }
    }

    const order = await razorpay.orders.fetch(orderId);
    const orderUserId = order?.notes?.userId;
    const orderEventId = order?.notes?.eventId;
    const orderSeatCount = Number(order?.notes?.seatCount || 0);
    const orderTicketPrice = Number(order?.notes?.ticketPrice || 0);
    const orderConvenienceFee = Number(order?.notes?.convenienceFee || 0);

    if (hasText(orderUserId) && orderUserId !== user.id) {
      throw createHttpError(403, "Order does not belong to this user");
    }

    if (hasText(eventId) && hasText(orderEventId) && eventId !== orderEventId) {
      throw createHttpError(400, "Event mismatch for payment order");
    }

    if (seatCount && orderSeatCount && seatCount !== orderSeatCount) {
      throw createHttpError(400, "Seat count mismatch for payment order");
    }

    await recordConvenienceFeeRevenue({
      eventId: orderEventId || eventId,
      seatCount: orderSeatCount || seatCount,
      ticketPrice: orderTicketPrice,
      convenienceFee: orderConvenienceFee,
    });

    const eventTitle = hasText(orderEventId)
      ? await fetchEventById(orderEventId).then((event) => event?.title || "Event").catch(() => "Event")
      : "Event";

    publishNotificationEvent("payment.success", {
      userId: user.id,
      eventId: orderEventId || eventId,
      eventTitle,
      amount: Number(order?.amount || 0) / 100,
      orderId,
      paymentId,
    }).catch(() => {});

    return {
      verified: true,
      message: "Payment verified successfully",
      payment: {
        orderId,
        paymentId,
        signature,
      },
    };
  } catch (error) {
    const fallbackEventId = readText(body?.eventId);
    const eventTitle = hasText(fallbackEventId)
      ? await fetchEventById(fallbackEventId).then((event) => event?.title || "Event").catch(() => "Event")
      : "Event";

    publishNotificationEvent("payment.failed", {
      userId: user.id,
      eventId: fallbackEventId,
      eventTitle,
      orderId,
      paymentId,
      reason: error?.message || "payment_verification_failed",
    }).catch(() => {});

    throw error;
  }
}

module.exports = {
  verifyPayment,
};
