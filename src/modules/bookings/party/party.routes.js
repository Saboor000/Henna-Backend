import { Router } from "express";
import { submitPartyBooking } from "./party.controller.js";
// import { bookingLimiter } from "../../../middleware/rateLimiter.js";

const router = Router();

router.post("/party", submitPartyBooking);

export default router;
