import express from "express";
import {
  getContracts,
  createContract,
  getMyContracts,
  updateContractStatus,
} from "../controllers/contract.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getContracts);
router.post("/", auth, createContract);
router.get("/me", auth, getMyContracts);
router.put("/:id", updateContractStatus);

export default router;