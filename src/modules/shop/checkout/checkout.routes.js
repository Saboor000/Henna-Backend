import { Router } from "express";
import express from "express";
import { checkout, stripeWebhook } from "./checkout.controller.js";

const router = Router();

// ⚠️ Raw body required for Stripe signature — must come before express.json()
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

router.post("/checkout", checkout);

router.get("/checkout/success", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Payment successful!",
    sessionId: req.query.session_id,
  });
});

router.get("/checkout/cancel", (req, res) => {
  res.status(200).json({
    success: false,
    message: "Payment cancelled.",
  });
});
export default router;
