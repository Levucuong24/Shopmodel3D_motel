import InboxConversation from "./InboxConversation.js";
import InboxMessage from "./InboxMessage.js";
import { getIO } from "../../sockets/index.js";

// Lấy danh sách hội thoại
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await InboxConversation.find()
      .populate("customer_id", "full_name avatar")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// Lấy tin nhắn của một hội thoại
export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messages = await InboxMessage.find({ conversation_id: id })
      .populate("staff_id", "full_name avatar")
      .sort({ createdAt: 1 });

    // Mark as read
    await InboxConversation.findByIdAndUpdate(id, { unread_count: 0 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Staff gửi tin nhắn
export const replyMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Nội dung trống" });

    const message = await InboxMessage.create({
      conversation_id: id,
      sender_type: "staff",
      staff_id: req.user.id,
      content,
    });

    const conversation = await InboxConversation.findByIdAndUpdate(
      id,
      { last_message: `Staff: ${content}` },
      { new: true }
    );

    const populatedMessage = await InboxMessage.findById(message._id).populate("staff_id", "full_name avatar");

    try {
      const io = getIO();
      io.emit("new_inbox_message", { conversation, message: populatedMessage });
    } catch (e) {
      console.log("Socket emit error:", e.message);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

// Webhook giả lập nhận tin từ Zalo
export const zaloWebhook = async (req, res, next) => {
  try {
    const { guest_zalo_id, guest_name, content } = req.body;

    if (!guest_zalo_id || !content) {
      return res.status(400).json({ message: "Thiếu thông tin Zalo" });
    }

    let conversation = await InboxConversation.findOne({ guest_zalo_id, channel: "zalo" });

    if (!conversation) {
      conversation = await InboxConversation.create({
        channel: "zalo",
        guest_name: guest_name || "Khách Zalo",
        guest_zalo_id,
        last_message: content,
        unread_count: 1,
      });
    } else {
      conversation.last_message = content;
      conversation.unread_count += 1;
      await conversation.save();
    }

    const message = await InboxMessage.create({
      conversation_id: conversation._id,
      sender_type: "customer",
      content,
    });

    try {
      const io = getIO();
      io.emit("new_inbox_message", { conversation, message });
    } catch (e) {
      console.log("Socket emit error:", e.message);
    }

    res.status(201).json({ message: "Đã nhận tin nhắn Zalo", data: message });
  } catch (error) {
    next(error);
  }
};

// Khách hàng web gửi tin nhắn
export const webCustomerMessage = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Bạn cần đăng nhập" });
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Nội dung trống" });

    let conversation = await InboxConversation.findOne({ customer_id: req.user.id, channel: "web" });

    if (!conversation) {
      conversation = await InboxConversation.create({
        channel: "web",
        customer_id: req.user.id,
        guest_name: req.user.full_name,
        last_message: content,
        unread_count: 1,
      });
    } else {
      conversation.last_message = content;
      conversation.unread_count += 1;
      await conversation.save();
    }

    const message = await InboxMessage.create({
      conversation_id: conversation._id,
      sender_type: "customer",
      content,
    });

    // Populate cho trả về socket
    const populatedConv = await InboxConversation.findById(conversation._id).populate("customer_id", "full_name avatar");

    try {
      const io = getIO();
      io.emit("new_inbox_message", { conversation: populatedConv, message });
    } catch (e) {
      console.log("Socket emit error:", e.message);
    }

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
