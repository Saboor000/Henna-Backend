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

export default router;
