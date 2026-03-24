import express from "express";
import { chat } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/", chat);

export default router;