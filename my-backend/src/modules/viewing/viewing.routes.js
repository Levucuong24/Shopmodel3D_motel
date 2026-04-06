import express from "express";
import auth from "../../middlewares/auth.middleware.js";
import { createViewingRequest, getAllViewingRequests, getViewingRequestsByRoom, getMyViewingRequests, updateViewingStatus } from "./viewing.controller.js";

const router = express.Router();

router.get("/", authOptional, getAllViewingRequests);
router.get("/my-viewings", auth, getMyViewingRequests);
router.get("/room/:roomId", getViewingRequestsByRoom);
router.post("/", authOptional, createViewingRequest);
router.put("/:id/status", auth, updateViewingStatus);

function authOptional(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return next();
  }

  return auth(req, res, next);
}

export default router;
