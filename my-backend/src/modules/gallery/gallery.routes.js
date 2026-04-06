import express from "express";
import { getGalleryImages, addGalleryImage, updateGalleryImage, deleteGalleryImage, uploadGalleryImage } from "./gallery.controller.js";
import auth from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getGalleryImages);
router.post("/upload-image", auth, upload.single("image"), uploadGalleryImage);
router.post("/", auth, addGalleryImage);
router.put("/:id", auth, updateGalleryImage);
router.delete("/:id", auth, deleteGalleryImage);

export default router;
