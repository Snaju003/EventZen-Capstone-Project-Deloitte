let checkoutScriptPromise;
const RAZORPAY_SESSION_COOKIE_NAME = "rzp_unified_session_id";

function loadCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (checkoutScriptPromise) {
    return checkoutScriptPromise;
  }

  checkoutScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

  return checkoutScriptPromise;
}

function readCookieValue(cookieName) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieString = String(document.cookie || "");
  if (!cookieString) {
    return null;
  }

  const prefixedName = `${cookieName}=`;
  const matchingChunk = cookieString
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(prefixedName));

  if (!matchingChunk) {
    return null;
  }

  const rawValue = matchingChunk.slice(prefixedName.length);
  if (!rawValue) {
    return null;
  }

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

function writeCookieValue(cookieName, cookieValue) {
  if (typeof document === "undefined" || !cookieValue) {
    return;
  }

  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const sameSitePolicy = isHttps ? "None" : "Lax";
  const secureFlag = isHttps ? "; Secure" : "";

  document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; path=/; SameSite=${sameSitePolicy}${secureFlag}`;
}

function generateSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}_${randomPart}`;
}

function ensureRazorpaySessionCookie() {
  const existingSessionId = readCookieValue(RAZORPAY_SESSION_COOKIE_NAME);
  const sessionId = existingSessionId || generateSessionId();

  writeCookieValue(RAZORPAY_SESSION_COOKIE_NAME, sessionId);
}

export async function prepareRazorpaySession() {
  const loaded = await loadCheckoutScript();
  if (!loaded || typeof window === "undefined" || !window.Razorpay) {
    throw new Error("Unable to load Razorpay checkout. Please try again.");
  }

  ensureRazorpaySessionCookie();
}

export async function openRazorpayCheckout({
  key,
  amount,
  currency,
  orderId,
  name,
  description,
  prefill,
}) {
  await prepareRazorpaySession();

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill,
      theme: {
        color: "#0f172a",
      },
      handler: (response) => {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment was cancelled."));
        },
      },
    });

    razorpay.on("payment.failed", (event) => {
      const failureMessage = event?.error?.description || "Payment failed. Please try again.";
      reject(new Error(failureMessage));
    });

    razorpay.open();
  });
}
