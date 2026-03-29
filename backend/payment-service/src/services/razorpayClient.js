const Razorpay = require("razorpay");
const { createHttpError } = require("../utils/httpError");
const { hasText } = require("../utils/text");

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const looksLikePlaceholder = (value) => {
    if (!hasText(value)) {
      return true;
    }

    const normalized = value.trim().toLowerCase();
    return (
      normalized.includes("your_key")
      || normalized.includes("your_razorpay")
      || normalized.includes("replace")
    );
  };

  if (!hasText(keyId) || !hasText(keySecret) || looksLikePlaceholder(keyId) || looksLikePlaceholder(keySecret)) {
    throw createHttpError(500, "Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

module.exports = {
  getRazorpayClient,
};
