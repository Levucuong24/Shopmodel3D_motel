import express from "express";

import authRoutes from "./auth.routes.js";
import roomRoutes from "./room.routes.js";
import paymentRoutes from "./payment.routes.js";
import chatbotRoutes from "./chatbot.routes.js";
import aiRoutes from "./ai.routes.js";
import contractRoutes from "./contract.routes.js";
import reviewRoutes from "./review.routes.js";
import userRoutes from "./user.routes.js";
import viewingRoutes from "./viewing.routes.js";

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
