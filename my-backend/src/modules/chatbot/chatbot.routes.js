import express from "express";
import { chat } from "./chatbot.controller.js";

const router = express.Router();

router.post("/", chat);

export default router;