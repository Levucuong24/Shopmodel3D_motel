import { getAllRooms, createRoom, getRoomById as getRoomByIdService, updateRoomById } from "../services/room.service.js";

export const getRooms = async (req, res) => {
  const data = await getAllRooms();
  res.json(data);
};

export const getRoomById = async (req, res) => {
  try {
    const data = await getRoomByIdService(req.params.id);
    if (!data) return res.status(404).json({ message: "Room not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createNewRoom = async (req, res) => {
  const room = await createRoom(req.body);
  res.json(room);
};

export const uploadRoomImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Vui lòng chọn ảnh phòng để tải lên" });
  }

  return res.json({
    message: "Tải ảnh phòng thành công",
    imageUrl: `/uploads/${req.file.filename}`,
  });
};

export const updateRoom = async (req, res) => {
  try {
    const room = await updateRoomById(req.params.id, req.body);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
