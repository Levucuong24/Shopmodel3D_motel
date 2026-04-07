import { getAllRooms, createRoom, getRoomById as getRoomByIdService, updateRoomById, deleteRoomById as deleteRoomByIdService } from "./room.service.js";

export const getRooms = async (req, res) => {
  const data = await getAllRooms({ approval_status: "approved" });
  res.json(data);
};

export const getAdminRooms = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = {};
    if (userRole === "staff") {
      query = { created_by: userId };
    } else if (userRole === "admin") {
      query = {};
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const data = await getAllRooms(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const data = await getRoomByIdService(req.params.id);
    if (!data) return res.status(404).json({ message: "Room not found" });

    // Access control: 
    // 1. If room is approved, anyone can see it.
    // 2. If room is NOT approved, only Admin or the Owner (Staff) can see it.
    if (data.approval_status !== "approved") {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(403).json({ message: "Phòng này đang chờ duyệt, vui lòng quay lại sau" });
      }

      // Check user role/id if token exists
      // Note: Ideally we'd use the auth middleware, but getRoomById is used by public too.
      // We can check if req.user exists (if we add auth middleware as optional to this route)
      if (!req.user || (req.user.role !== "admin" && req.user.id !== data.created_by?.toString())) {
        return res.status(403).json({ message: "Bạn không có quyền xem phòng này" });
      }
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createNewRoom = async (req, res) => {
  try {
    const roomData = { ...req.body };
    const userRole = req.user.role;

    if (userRole === "admin") {
      roomData.approval_status = "approved";
    } else {
      roomData.approval_status = "pending";
    }

    // Ensure created_by is correctly tied to the current logged-in user
    roomData.created_by = req.user.id;

    const room = await createRoom(roomData);
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const approveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // should be 'approved' or 'rejected'

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới có quyền duyệt phòng" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const room = await updateRoomById(id, { approval_status: status });
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
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

export const deleteRoom = async (req, res) => {
  try {
    const room = await deleteRoomByIdService(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
