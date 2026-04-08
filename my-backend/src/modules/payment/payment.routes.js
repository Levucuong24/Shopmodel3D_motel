import express from "express";
import {
  createPayment,
  getPaymentById,
  paymentWebhook,
  getPayments,
  getMyRentalPayment,
  getAdminRevenue,
  confirmRental,
  requestRentalCancellation,
  confirmRentalCancellation,
  updatePayment,
  deletePayment,
} from "./payment.controller.js";
import auth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, getPayments);
router.get("/my-rental", auth, getMyRentalPayment);
router.get("/admin-revenue", auth, getAdminRevenue);
router.post("/create", createPayment);
router.post("/webhook", paymentWebhook);
router.get("/:id", getPaymentById);
router.put("/:id", auth, updatePayment);
router.delete("/:id", auth, deletePayment);
router.post("/:id/confirm-rental", auth, confirmRental);
router.post("/:id/request-cancel", auth, requestRentalCancellation);
router.post("/:id/confirm-cancel", auth, confirmRentalCancellation);

export default router;
