import express from "express";
import {
  getReviewsByRoom,
  createReview,
  approveReview,
  getTopLandlords,
} from "./review.controller.js";
import auth from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/top-landlords", getTopLandlords);
router.get("/:roomId", getReviewsByRoom);
router.post("/", auth, createReview);
router.put("/:id/approve", approveReview);

export default router;