import express from "express";
import {
  getConversations,
  getMessages,
  replyMessage,
  zaloWebhook,
  webCustomerMessage
} from "./inbox.controller.js";
import auth from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Staff routes
router.route("/conversations").get(auth, getConversations); // In real app, protect with staffOnly but for demo protect is enough
router.route("/:id/messages").get(auth, getMessages);
router.route("/:id/reply").post(auth, replyMessage);

// Webhook for Zalo (public or secured with secret)
router.route("/webhook/zalo").post(zaloWebhook);

// Customer web route
router.route("/customer/send").post(auth, webCustomerMessage);

export default router;
