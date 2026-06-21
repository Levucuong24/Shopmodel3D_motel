import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  toggleLike,
  createComment,
} from "./community.controller.js";
import auth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getPosts).post(auth, createPost);
router.route("/:id").get(getPost);
router.route("/:id/like").post(auth, toggleLike);
router.route("/:id/comments").post(auth, createComment);

export default router;
