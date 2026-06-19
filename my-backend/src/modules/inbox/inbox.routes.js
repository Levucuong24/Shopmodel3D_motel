import express from "express";
import {
  getConversations,
  getMessages,
  replyMessage,
  zaloWebhook,
  webCustomerMessage
} from "./inbox.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Staff routes
router.route("/conversations").get(protect, getConversations); // In real app, protect with staffOnly but for demo protect is enough
router.route("/:id/messages").get(protect, getMessages);
router.route("/:id/reply").post(protect, replyMessage);

// Webhook for Zalo (public or secured with secret)
router.route("/webhook/zalo").post(zaloWebhook);

// Customer web route
router.route("/customer/send").post(protect, webCustomerMessage);

export default router;
