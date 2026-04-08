import express from "express";
import { createPayment, getPaymentById, paymentWebhook, getPayments, getAdminRevenue, confirmRental } from "./payment.controller.js";
import auth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, getPayments);
router.get("/admin-revenue", auth, getAdminRevenue);
router.post("/create", createPayment);
router.post("/webhook", paymentWebhook);
router.get("/:id", getPaymentById);
router.post("/:id/confirm-rental", auth, confirmRental);

export default router;
