// src/models/ChatSession.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  started_at: Date,
  last_active: Date,
});

export default mongoose.model("ChatSession", schema);