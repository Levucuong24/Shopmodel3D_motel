import Gallery from "./Gallery.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

export const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách hình ảnh", error: err.message });
  }
};

export const addGalleryImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: "Vui lòng cung cấp URL hình ảnh" });
    }

    const newImage = new Gallery({ imageUrl });
    await newImage.save();
    
    res.status(201).json(newImage);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm hình ảnh", error: err.message });
  }
};

export const updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      { imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ message: "Không tìm thấy hình ảnh" });
    }

    res.json(updatedImage);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật hình ảnh", error: err.message });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await Gallery.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({ message: "Không tìm thấy hình ảnh" });
    }

    res.json({ message: "Đã xóa hình ảnh thành công", deletedId: id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa hình ảnh", error: err.message });
  }
};

export const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }
    const imageUrl = await uploadToCloudinary(req.file.buffer, "gallery");
    res.json({ imageUrl });
  } catch (error) {
    console.error("Upload gallery image error:", error);
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};
