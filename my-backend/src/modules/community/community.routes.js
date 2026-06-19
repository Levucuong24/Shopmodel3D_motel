import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  toggleLike,
  createComment,
} from "./community.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getPosts).post(protect, createPost);
router.route("/:id").get(getPost);
router.route("/:id/like").post(protect, toggleLike);
router.route("/:id/comments").post(protect, createComment);

export default router;
