import Room from "../models/Room.js";

export const getAllRooms = async () => {
  return await Room.find();
};

export const getRoomById = async (id) => {
  return await Room.findById(id);
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
