import express from "express";
import { login, register, resetPassword, googleLogin } from "./auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);

export default router;
