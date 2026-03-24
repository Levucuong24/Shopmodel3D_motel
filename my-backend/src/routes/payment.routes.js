import express from "express";
import { createPayment, getPaymentById, paymentWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create", createPayment);
router.post("/webhook", paymentWebhook);
router.get("/:id", getPaymentById);

export default router;
