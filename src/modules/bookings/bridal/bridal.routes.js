import express from "express";
import { submitBridalBooking } from "./bridal.controller.js";
// import { bookingLimiter } from "../../../middleware/rateLimiter.js";

const router = express.Router();

router.post("/bridal", submitBridalBooking);

export default router;
