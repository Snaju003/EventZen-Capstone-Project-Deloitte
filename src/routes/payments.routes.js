const express = require("express");

const { requireGatewayIdentity } = require("../middleware/gatewayIdentity.middleware");
const { fetchEventById } = require("../services/eventClient");
const { createPaymentOrder } = require("../services/paymentOrder.service");
const { verifyPayment } = require("../services/paymentVerification.service");
const { getRevenueSummary } = require("../services/revenueSummary.service");
const { getRazorpayClient } = require("../services/razorpayClient");

const router = express.Router();
const DEFAULT_CURRENCY = process.env.PAYMENT_CURRENCY || "INR";

router.post("/payments/orders", requireGatewayIdentity, async (req, res, next) => {
  try {
    const orderPayload = await createPaymentOrder({
      user: req.user,
      body: req.body,
      currency: DEFAULT_CURRENCY,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      fetchEventById,
      getRazorpayClient,
    });

    return res.status(201).json(orderPayload);
  } catch (error) {
    return next(error);
  }
});

router.post("/payments/verify", requireGatewayIdentity, async (req, res, next) => {
  try {
    const verificationResult = await verifyPayment({
      user: req.user,
      body: req.body,
      razorpaySecret: process.env.RAZORPAY_KEY_SECRET,
      getRazorpayClient,
    });

    return res.status(200).json(verificationResult);
  } catch (error) {
    return next(error);
  }
});

router.get("/payments/revenue/summary", requireGatewayIdentity, async (req, res, next) => {
  try {
    const summary = await getRevenueSummary();
    return res.status(200).json(summary);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
