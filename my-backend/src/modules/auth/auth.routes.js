import express from "express";
import { login, register, resetPassword, googleLogin, requestOTP, verifyOTP } from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.use(authLimiter);

router.post("/login", login);
router.post("/register", register);
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);

export default router;
