import RoommatePost from "./RoommatePost.js";
import RoommateMessage from "./RoommateMessage.js";
import Room from "../room/Room.js";
import Contract from "../contract/Contract.js";
import User from "../user/User.js";

// Helper to check if user has rented a room
const getRentedRoomsForUser = async (userId) => {
  // Find via active contracts
  const activeContracts = await Contract.find({
    user_id: userId,
    status: "active",
  }).populate("room_id");

  const roomsFromContracts = activeContracts
    .map((c) => c.room_id)
    .filter((r) => r !== null);

  // Find via tenant_id on Room directly
  const roomsDirect = await Room.find({ tenant_id: userId });

  // Merge lists and deduplicate by ID
  const allRooms = [...roomsFromContracts, ...roomsDirect];
  const uniqueRoomsMap = new Map();
  allRooms.forEach((r) => {
    uniqueRoomsMap.set(r._id.toString(), r);
  });

  return Array.from(uniqueRoomsMap.values());
};

// Endpoints
export const getRentedRooms = async (req, res) => {
  try {
    const rooms = await getRentedRoomsForUser(req.user.id);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { room_id, title, content } = req.body;

    if (!room_id || !title || !content) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Check if the user actually rented this room
    const rentedRooms = await getRentedRoomsForUser(req.user.id);
    const hasRented = rentedRooms.some((r) => r._id.toString() === room_id);

    if (!hasRented) {
      return res.status(403).json({ message: "Bạn chỉ có thể đăng bài tìm người ở ghép cho phòng bạn đang thuê" });
    }

    // Check if there is already an open post for this room by this user
    const existingPost = await RoommatePost.findOne({
      user_id: req.user.id,
      room_id,
      status: "open",
    });

    if (existingPost) {
      return res.status(400).json({ message: "Bạn đã có bài đăng đang tìm người ở ghép cho phòng này" });
    }

    const post = await RoommatePost.create({
      user_id: req.user.id,
      room_id,
      title,
      content,
      status: "open",
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await RoommatePost.find({ status: "open" })
      .populate("user_id", "full_name email phone avatar")
      .populate("room_id")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await RoommatePost.findById(req.params.id)
      .populate("user_id", "full_name email phone avatar")
      .populate("room_id");

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { post_id, message } = req.body;

    if (!post_id || !message) {
      return res.status(400).json({ message: "Thiếu thông tin tin nhắn" });
    }

    const post = await RoommatePost.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    const sender_id = req.user.id;
    // Receiver is the post owner
    const receiver_id = post.user_id.toString();

    if (sender_id === receiver_id) {
      // If owner is sending a message, they must specify who they are replying to in the request body
      const { reply_to } = req.body;
      if (!reply_to) {
        return res.status(400).json({ message: "Chủ bài đăng cần chỉ rõ người nhận phản hồi (reply_to)" });
      }

      const msg = await RoommateMessage.create({
        post_id,
        sender_id,
        receiver_id: reply_to,
        message,
      });
      return res.status(201).json(msg);
    }

    // Normal viewer messaging the owner
    const msg = await RoommateMessage.create({
      post_id,
      sender_id,
      receiver_id,
      message,
    });

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { postId } = req.params;
    const { otherUserId } = req.query; // Used by post owner to query specific user messages

    const post = await RoommatePost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    const userId = req.user.id;
    const isOwner = post.user_id.toString() === userId;

    let partnerId;
    if (isOwner) {
      if (!otherUserId) {
        return res.status(400).json({ message: "Chủ bài đăng cần cung cấp otherUserId để xem đoạn hội thoại" });
      }
      partnerId = otherUserId;
    } else {
      partnerId = post.user_id.toString();
    }

    const messages = await RoommateMessage.find({
      post_id: postId,
      $or: [
        { sender_id: userId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where current user is sender or receiver
    const messages = await RoommateMessage.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .populate("post_id")
      .populate("sender_id", "full_name avatar")
      .populate("receiver_id", "full_name avatar")
      .sort({ createdAt: -1 });

    // Group them in-memory to get active conversations
    const conversationMap = new Map();

    for (const msg of messages) {
      if (!msg.post_id) continue;

      const postId = msg.post_id._id.toString();
      const isOwner = msg.post_id.user_id.toString() === userId;
      
      // The other user in the conversation
      const otherUser = msg.sender_id._id.toString() === userId ? msg.receiver_id : msg.sender_id;
      if (!otherUser) continue;

      const otherUserId = otherUser._id.toString();
      const key = `${postId}_${otherUserId}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          post: msg.post_id,
          otherUser: otherUser,
          lastMessage: msg.message,
          updatedAt: msg.createdAt,
          isOwner,
        });
      }
    }

    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
