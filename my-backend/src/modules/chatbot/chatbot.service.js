import { GoogleGenAI } from "@google/genai";
import Contract from "../contract/Contract.js";
import Payment from "../payment/Payment.js";
import Review from "../review/Review.js";
import Room from "../room/Room.js";
import SavedRoom from "../room/SavedRoom.js";
import User from "../user/User.js";
import ViewingRequest from "../viewing/ViewingRequest.js";

const getGeminiApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
};

export const chatbotReply = async (text) => {
  const query = (text || "").trim();

  if (!query) {
    return {
      reply: "Bạn muốn hỏi gì về hệ thống? Vui lòng gửi câu hỏi chi tiết.",
      suggestions: [],
    };
  }

  const [rooms, reviews, payments, viewings, users, contracts, savedRooms] = await Promise.all([
    Room.find().lean(),
    Review.find().populate("room_id", "name location").populate("user_id", "full_name").lean(),
    Payment.find().populate("room_id", "name location").lean(),
    ViewingRequest.find().populate("room_id", "name location").populate("user_id", "full_name email phone").lean(),
    User.find().select("-password").lean(),
    Contract.find().populate("room_id", "name location").populate("user_id", "full_name email").lean(),
    SavedRoom.find().lean(),
  ]);

  const compactRooms = rooms.map(r => ({ id: r._id, name: r.name, location: r.location, price: r.price, status: r.status, amenities: r.amenities, specs: r.specs }));
  const compactUsers = users.map(u => ({ id: u._id, name: u.full_name, email: u.email, role: u.role }));
  const compactPayments = payments.map(p => ({ id: p._id, amount: p.amount, method: p.payment_method, status: p.status, type: p.payment_type, room: p.room_id?.name }));
  const compactContracts = contracts.map(c => ({ id: c._id, user: c.user_id?.full_name, room: c.room_id?.name, status: c.status, startDate: c.start_date, endDate: c.end_date }));
  const compactViewings = viewings.map(v => ({ id: v._id, user: v.user_id?.full_name, room: v.room_id?.name, date: v.date, time: v.time, status: v.status }));
  const compactReviews = reviews.map(r => ({ id: r._id, user: r.user_id?.full_name, room: r.room_id?.name, rating: r.rating, comment: r.comment, status: r.status }));

  const dbJSON = JSON.stringify({
    Rooms: compactRooms,
    Users: compactUsers,
    Payments: compactPayments,
    Contracts: compactContracts,
    Viewings: compactViewings,
    Reviews: compactReviews
  });

  const prompt = `
Bạn là AI chatbot chăm sóc khách hàng siêu năng lực cho website cho thuê phòng.
Đây là TOÀN BỘ database hiện tại của hệ thống (dạng JSON):
"""
${dbJSON}
"""

Người dùng hỏi: "${query}"

Yêu cầu:
1. Căn cứ CHÍNH XÁC vào dữ liệu cung cấp, hãy tự động phân tích và đưa ra câu trả lời chi tiết, chính xác, thân thiện.
2. Nếu câu hỏi liên quan đến tìm phòng (gợi ý phòng...), cố gắng gợi ý từ 1 đến tối đa 4 phòng phù hợp nhất. Điền ID các phòng được gợi ý vào mảng \`suggested_room_ids\`.
3. Bạn ĐƯỢC PHÉP trả lời về các khoản thanh toán, giao dịch, thống kê doanh thu, người dùng, đánh giá, lịch xem phòng, hợp đồng nều người dùng muốn tra cứu, đây là tính năng AI đọc nguyên database.
4. LUÔN trả về kết quả theo định dạng JSON chuẩn.

Schema:
{
  "reply": "Câu trả lời của bạn, rõ ràng mạch lạc.",
  "suggested_room_ids": ["id1", "id2"] // mảng string chứa ID phòng cần gợi ý, rỗng nếu không có gợi ý.
}
  `;

  try {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return {
        reply: "Mình không thể trả lời vì hệ thống thiếu cấu hình API KEY.",
        suggestions: [],
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);
    let suggestions = [];

    if (Array.isArray(result.suggested_room_ids) && result.suggested_room_ids.length > 0) {
      suggestions = rooms.filter((room) => result.suggested_room_ids.includes(room._id.toString()));
    }

    return {
      reply: result.reply || "Mình chưa có câu trả lời cho vấn đề này.",
      suggestions,
    };
  } catch (err) {
    console.error("AI Chatbot Error:", err);
    return {
      reply: "Xin lỗi, hệ thống AI hiện đang xử lý khối lượng lớn hoặc quá tải, vui lòng thử lại sau.",
      suggestions: [],
    };
  }
};
