export async function prepareRazorpaySession() {
  return { bypassed: true };
}

function generateBypassId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function openRazorpayCheckout({
  orderId,
}) {
  await prepareRazorpaySession();

  return {
    razorpayOrderId: orderId || generateBypassId("bypass_order"),
    razorpayPaymentId: generateBypassId("bypass_payment"),
    razorpaySignature: generateBypassId("bypass_signature"),
  };
}
