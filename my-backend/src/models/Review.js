// src/models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    rating: { type: Number, min: 1, max: 5 },

    content: String,

    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export default mongoose.model("Review", reviewSchema);