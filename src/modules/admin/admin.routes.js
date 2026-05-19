import { Router } from "express";
import { adminLogin } from "./admin.controller.js";
import { loginLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

router.post("/login", loginLimiter, adminLogin);

export default router;
