import express from "express";
import {
  getUsers,
  getProfile,
  updateProfile,
  saveRoom,
  removeSavedRoom,
  uploadAvatar,
  updateUserRole,
} from "./user.controller.js";
import auth from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);
router.post("/me/avatar", auth, upload.single("avatar"), uploadAvatar);

router.post("/save-room", auth, saveRoom);
router.post("/remove-room", auth, removeSavedRoom);

router.put("/:id/role", auth, updateUserRole);

export default router;
