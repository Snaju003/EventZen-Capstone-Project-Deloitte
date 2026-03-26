let checkoutScriptPromise;

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

export async function openRazorpayCheckout({
  key,
  amount,
  currency,
  orderId,
  name,
  description,
  prefill,
}) {
  const loaded = await loadCheckoutScript();
  if (!loaded || typeof window === "undefined" || !window.Razorpay) {
    throw new Error("Unable to load Razorpay checkout. Please try again.");
  }

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
