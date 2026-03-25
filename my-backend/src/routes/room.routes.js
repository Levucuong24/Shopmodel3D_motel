import express from "express";
import { getRooms, createNewRoom, getRoomById, updateRoom, uploadRoomImage, deleteRoom } from "../controllers/room.controller.js";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/upload-image", auth, upload.single("image"), uploadRoomImage);
router.post("/", auth, createNewRoom);
router.put("/:id", auth, updateRoom);
router.delete("/:id", auth, deleteRoom);

export default router;
