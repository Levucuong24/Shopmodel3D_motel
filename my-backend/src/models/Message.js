// src/models/Message.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession" },
  sender: { type: String, enum: ["user", "bot"] },
  text: String,
  suggestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  created_at: Date,
});

export default mongoose.model("Message", schema);