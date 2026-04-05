import express from "express";

import authRoutes from "./auth/auth.routes.js";
import roomRoutes from "./room/room.routes.js";
import paymentRoutes from "./payment/payment.routes.js";
import chatbotRoutes from "./chatbot/chatbot.routes.js";
import aiRoutes from "./ai/ai.routes.js";
import contractRoutes from "./contract/contract.routes.js";
import reviewRoutes from "./review/review.routes.js";
import userRoutes from "./user/user.routes.js";
import viewingRoutes from "./viewing/viewing.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/payments", paymentRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/ai", aiRoutes);
router.use("/contracts", contractRoutes);
router.use("/reviews", reviewRoutes);
router.use("/users", userRoutes);
router.use("/viewings", viewingRoutes);

export default router;
