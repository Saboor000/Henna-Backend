import { Router } from "express";
import {
  listClasses,
  classDetail,
  enrollClass,
  addClass,
} from "./classes.controller.js";
import { adminAuth } from "../../middleware/adminAuth.js";
import { bookingLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

router.post("/admin/add", adminAuth, addClass);
router.get("/", listClasses);
router.get("/:id", classDetail);
router.post("/enroll", bookingLimiter, enrollClass);

export default router;
