import express from "express";
import { generate } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate", generate);

export default router;