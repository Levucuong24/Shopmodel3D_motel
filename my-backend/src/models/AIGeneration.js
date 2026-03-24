// src/models/AIGeneration.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  prompt_text: String,

  status: {
    type: String,
    enum: ["generating", "completed", "failed"],
  },

  result_url: String,

  created_at: Date,

  time_taken: Number,
});

export default mongoose.model("AIGeneration", schema);