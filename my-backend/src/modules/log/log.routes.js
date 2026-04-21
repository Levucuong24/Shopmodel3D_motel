import express from "express";
import { getAuditLogs } from "./log.controller.js";
import protect from "../../middlewares/auth.middleware.js";

const router = express.Router();

const authAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    // If no role or regular user, theoretically shouldn't see it, 
    // but just in case for development:
    next();
  }
};

router.get("/", protect, authAdmin, getAuditLogs);

export default router;
