import mongoose from "mongoose";

const inboxMessageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InboxConversation",
      required: true,
    },
    sender_type: {
      type: String,
      enum: ["customer", "staff", "system"],
      required: true,
    },
    // If staff replied, store their ID
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InboxMessage", inboxMessageSchema);
