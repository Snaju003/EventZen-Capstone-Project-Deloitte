const express = require("express");

const { requireGatewayIdentity } = require("../middleware/gatewayIdentity.middleware");
const { fetchEventById } = require("../services/eventClient");
const { createPaymentOrder } = require("../services/paymentOrder.service");
const { verifyPayment } = require("../services/paymentVerification.service");
const { getRevenueSummary } = require("../services/revenueSummary.service");
const { getRazorpayClient, getRazorpayCredentials } = require("../services/razorpayClient");

const router = express.Router();
const DEFAULT_CURRENCY = process.env.PAYMENT_CURRENCY || "INR";

async function createOrderHandler(req, res, next) {
  try {
    const { keyId } = getRazorpayCredentials();

    const orderPayload = await createPaymentOrder({
      user: req.user,
      body: req.body,
      currency: DEFAULT_CURRENCY,
      razorpayKeyId: keyId,
      fetchEventById,
      getRazorpayClient,
    });

    return res.status(201).json(orderPayload);
  } catch (error) {
    return next(error);
  }
}

router.post("/payments/orders", requireGatewayIdentity, createOrderHandler);
router.post("/payments/create-order", requireGatewayIdentity, createOrderHandler);

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

async function getRevenueSummaryHandler(req, res, next) {
  try {
    const summary = await getRevenueSummary();
    return res.status(200).json(summary);
  } catch (error) {
    return next(error);
  }
}

router.get("/payments/revenue/summary", requireGatewayIdentity, getRevenueSummaryHandler);
router.get("/payments/revenue-summary", requireGatewayIdentity, getRevenueSummaryHandler);

module.exports = router;
