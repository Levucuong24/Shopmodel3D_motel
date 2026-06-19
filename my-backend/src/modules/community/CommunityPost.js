import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Thảo luận", "Mua bán đồ cũ", "Tìm bạn ở ghép", "Review phòng trọ"],
      default: "Thảo luận",
    },
    location: {
      type: String,
      default: "Chung",
    },
    media: {
      type: [String],
      default: [],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("CommunityPost", communityPostSchema);
