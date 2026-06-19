import mongoose from "mongoose";

const inboxConversationSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ["web", "zalo"],
      default: "web",
    },
    // If registered user
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // For Zalo or guest
    guest_name: {
      type: String,
      default: "Khách vãng lai",
    },
    guest_phone: {
      type: String,
      default: null,
    },
    guest_zalo_id: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    last_message: {
      type: String,
      default: "",
    },
    unread_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InboxConversation", inboxConversationSchema);
