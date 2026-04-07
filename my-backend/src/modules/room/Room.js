import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    price: { type: Number, required: true },

    status: {
      type: String,
      enum: ["available", "reserved", "rented"],
      default: "available",
    },

    location: { type: String, required: true },

    specs: {
      area: Number,
      layout: String,
    },

    amenities: [String],

    pet_policy: String,

    description: String,

    images: [String],

    model_3d_url: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);