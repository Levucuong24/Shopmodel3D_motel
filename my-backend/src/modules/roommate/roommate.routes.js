import express from "express";
import {
  getRentedRooms,
  createPost,
  getPosts,
  getPostById,
  sendMessage,
  getMessages,
  getInquiries,
} from "./roommate.controller.js";
import auth from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);

// Authenticated routes
router.get("/rented-rooms", auth, getRentedRooms);
router.post("/posts", auth, createPost);
router.post("/messages", auth, sendMessage);
router.get("/messages/:postId", auth, getMessages);
router.get("/inquiries", auth, getInquiries);

export default router;
