import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    phone: String,
    avatar: String,

    role: {
      type: String,
      enum: ["admin", "customer", "staff"],
      default: "customer",
    },

    saved_rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);