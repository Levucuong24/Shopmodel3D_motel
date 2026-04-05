// src/models/SavedRoom.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});

export default mongoose.model("SavedRoom", schema);