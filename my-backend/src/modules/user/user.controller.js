// src/controllers/user.controller.js
import User from "./User.js";

export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("saved_rooms");

  res.json(user);
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    res.status(400).json({ message: error.message || "Không thể cập nhật hồ sơ" });
  }
};

export const saveRoom = async (req, res) => {
  const { room_id } = req.body;

  const user = await User.findById(req.user.id);

  if (!user.saved_rooms.includes(room_id)) {
    user.saved_rooms.push(room_id);
    await user.save();
  }

  res.json(user);
};

export const removeSavedRoom = async (req, res) => {
  const { room_id } = req.body;

  const user = await User.findById(req.user.id);

  user.saved_rooms = user.saved_rooms.filter(
    (id) => id.toString() !== room_id
  );

  await user.save();

  res.json(user);
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Chưa chọn file ảnh" });
  }

  const avatarPath = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarPath },
    { new: true, runValidators: true }
  ).select("-password");

  res.json(user);
};

export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { role } = req.body;
    if (!["admin", "customer", "staff"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};
