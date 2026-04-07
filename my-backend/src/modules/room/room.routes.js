import express from "express";
import { getRooms, getAdminRooms, createNewRoom, getRoomById, updateRoom, uploadRoomImage, deleteRoom, approveRoom } from "./room.controller.js";
import auth from "../../middlewares/auth.middleware.js";
import authOptional from "../../middlewares/authOptional.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getRooms);
router.get("/all", auth, getAdminRooms);
router.get("/:id", authOptional, getRoomById);
router.post("/upload-image", auth, upload.single("image"), uploadRoomImage);
router.post("/", auth, createNewRoom);
router.put("/:id/approve", auth, approveRoom);
router.put("/:id", auth, updateRoom);
router.delete("/:id", auth, deleteRoom);

export default router;
