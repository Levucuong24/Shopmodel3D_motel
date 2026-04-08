import Room from "./Room.js";

export const getAllRooms = async (query = {}) => {
  return await Room.find(query);
};

export const getRoomById = async (id) => {
  return await Room.findById(id).populate("created_by", "full_name phone avatar role");
};

export const createRoom = async (data) => {
  return await Room.create(data);
};

export const updateRoomById = async (id, data) => {
  return await Room.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRoomById = async (id) => {
  return await Room.findByIdAndDelete(id);
};
