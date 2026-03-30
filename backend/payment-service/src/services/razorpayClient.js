const Razorpay = require("razorpay");
const { createHttpError } = require("../utils/httpError");
const { hasText } = require("../utils/text");

function normalizeCredential(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return trimmed;
  }

  const startsWithDoubleQuote = trimmed.startsWith('"') && trimmed.endsWith('"');
  const startsWithSingleQuote = trimmed.startsWith("'") && trimmed.endsWith("'");

  if (startsWithDoubleQuote || startsWithSingleQuote) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function getRazorpayCredentials() {
  const keyId = normalizeCredential(process.env.RAZORPAY_KEY_ID);
  const keySecret = normalizeCredential(process.env.RAZORPAY_KEY_SECRET);

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

  return {
    keyId,
    keySecret,
  };
}

function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayCredentials();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

module.exports = {
  getRazorpayClient,
  getRazorpayCredentials,
};
