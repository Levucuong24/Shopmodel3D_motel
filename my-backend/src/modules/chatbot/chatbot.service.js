import { GoogleGenAI } from "@google/genai";
import Contract from "../contract/Contract.js";
import Payment from "../payment/Payment.js";
import Review from "../review/Review.js";
import Room from "../room/Room.js";
import SavedRoom from "../room/SavedRoom.js";
import User from "../user/User.js";
import ViewingRequest from "../viewing/ViewingRequest.js";

export const chatbotReply = async (text) => {
  const query = (text || "").trim();

  if (!query) {
    return {
      reply: "Bạn hãy nhập câu hỏi cụ thể về phòng, giá, lịch xem, đánh giá, thanh toán hoặc hợp đồng để mình hỗ trợ nhé.",
      suggestions: [],
    };
  }

  // Fetch all necessary data to build a RAG context
  const [rooms, reviews, payments, viewings, users, contracts, savedRooms] = await Promise.all([
    Room.find().lean(),
    Review.find({ status: "approved" }).populate("room_id", "name location").populate("user_id", "full_name").lean(),
    Payment.find().populate("room_id", "name location").lean(),
    ViewingRequest.find().populate("room_id", "name location").populate("user_id", "full_name email phone").lean(),
    User.find().select("-password").lean(),
    Contract.find().populate("room_id", "name location").populate("user_id", "full_name email").lean(),
    SavedRoom.find().lean(),
  ]);

  const availableRooms = rooms.filter((room) => room.status === "available");
  const reservedRooms = rooms.filter((room) => room.status === "reserved");
  const rentedRooms = rooms.filter((room) => room.status === "rented");
  const successPayments = payments.filter((payment) => payment.status === "success");
  const pendingViewings = viewings.filter((item) => item.status === "pending");
  const activeContracts = contracts.filter((contract) => contract.status === "active");
  const customerCount = users.filter((user) => user.role === "customer").length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const totalRevenue = successPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pendingPayments = payments.length - successPayments.length;

  const dataContext = `
Hệ thống quản lý phòng trọ hiện tại có số liệu sau:
- Tổng số phòng: ${rooms.length} (${availableRooms.length} trống, ${reservedRooms.length} cọc, ${rentedRooms.length} đang thuê)
- Số người dùng: ${customerCount} khách hàng, ${adminCount} admin
- Doanh thu: ${totalRevenue.toLocaleString("vi-VN")} VNĐ từ ${successPayments.length} giao dịch thành công.
- Hàng đợi thanh toán: ${pendingPayments} giao dịch chờ.
- Đánh giá: ${reviews.length} bài đánh giá đã duyệt.
- Lịch xem phòng: ${pendingViewings.length} lịch xem đang chờ duyệt trên tổng ${viewings.length} lịch.
- Hợp đồng: ${activeContracts.length} hợp đồng đang hiệu lực.

Danh sách các phòng trống chi tiết:
${availableRooms.map(r => `[Phòng ID: ${r._id}] ${r.name} tại ${r.location || 'chưa cập nhật'}, Giá: ${r.price ? r.price.toLocaleString("vi-VN") : 'liên hệ'}đ, Tiện ích: ${(r.amenities || []).join(', ')}`).join('\n')}

Danh sách một số bài đánh giá nổi bật đã phê duyệt:
${reviews.slice(-5).map(r => `- Phòng ${r.room_id?.name}: ${r.rating} sao - Khách bình luận: "${r.comment}"`).join('\n')}
  `.trim();

  const prompt = `
Bạn là AI Chatbot thông minh chăm sóc khách hàng và quản lý hệ thống phòng trọ. 
Nhiệm vụ của bạn là đọc dữ liệu từ cơ sở dữ liệu và trả lời câu hỏi của người dùng.

Dưới đây là thông tin thực tế từ hệ thống:
"""
${dataContext}
"""
Người dùng hỏi: "${query}"

Yêu cầu nhiệm vụ:
1. Trả lời câu hỏi một cách ngắn gọn, chính xác, mạch lạc, tự nhiên như người trọ nói chuyện với nhau, lấy dữ liệu gốc làm căn cứ. 
2. Trả lời bằng tiếng Việt. 
3. Nếu người dùng hỏi các câu hỏi chung, bạn có thể tổng hợp thông tin, tư vấn và nêu rõ con số từ database. Bạn CÓ THỂ ĐÓNG VAI QUẢN TRỊ VIÊN để báo cáo số liệu (như doanh thu, hợp đồng) nều được hỏi.
4. Ở cuối cùng, luôn trả về kết quả dưới định dạng JSON vì server chỉ đọc được JSON object với schema như dưới đây.
5. Nếu bạn muốn gợi ý cho người dùng xem các phòng cụ thể ở danh sách trống (sau khi tư vấn tìm phòng), hãy điền ID của tối đa 3 phòng đó vào mảng \`suggested_room_ids\`. Lấy ID ở trong phần [Phòng ID: ...]. Nếu không cần gợi ý cụ thể, hãy trả về mảng rỗng [].

ĐỊNH DẠNG BẮT BUỘC:
{
  "reply": "Văn bản trả lời của bạn ở đây",
  "suggested_room_ids": ["id1", "id2"]
}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text);

    let suggestions = [];
    if (result.suggested_room_ids && Array.isArray(result.suggested_room_ids) && result.suggested_room_ids.length > 0) {
      suggestions = rooms.filter(r => result.suggested_room_ids.includes(r._id.toString()));
    } else {
      // Default suggestions if Gemini didn't provide any but user might just want to see some rooms
      suggestions = availableRooms.slice(0, 3);
    }
    return {
      reply: result.reply || "Mình chưa thể tổng hợp câu trả lời lúc này.",
      suggestions: suggestions,
    };
  } catch (err) {
    console.error("AI Chatbot Error: ", err);
    return {
      reply: "Hệ thống AI hiện chưa phản hồi bình thường do thiếu GEMINI_API_KEY trong .env hoặc gặp lỗi từ Google. Vui lòng thêm biến GEMINI_API_KEY ở server.",
      suggestions: availableRooms.slice(0, 3),
    };
  }
};
