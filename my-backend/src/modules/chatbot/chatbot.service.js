import Contract from "../contract/Contract.js";
import Payment from "../payment/Payment.js";
import Review from "../review/Review.js";
import Room from "../room/Room.js";
import SavedRoom from "../room/SavedRoom.js";
import User from "../user/User.js";
import ViewingRequest from "../viewing/ViewingRequest.js";

const GROQ_API_KEYS = [
  process.env.GROQ_API_KEY
].filter(Boolean);
let currentKeyIndex = 0;

export const chatbotReply = async (text) => {
  const query = (text || "").trim();

  if (!query) {
    return {
      reply: "Bạn muốn hỏi gì về hệ thống? Vui lòng gửi câu hỏi chi tiết.",
      suggestions: [],
    };
  }

  const [rooms, reviews, payments, viewings, users, contracts, savedRooms] = await Promise.all([
    Room.find().populate("created_by", "full_name role").lean(),
    Review.find().populate("room_id", "name location").populate("user_id", "full_name").lean(),
    Payment.find().populate("room_id", "name location").lean(),
    ViewingRequest.find().populate("room_id", "name location").populate("user_id", "full_name email phone").lean(),
    User.find().select("-password").lean(),
    Contract.find().populate("room_id", "name location").populate("user_id", "full_name email").lean(),
    SavedRoom.find().lean(),
  ]);

  const compactRooms = rooms.map(r => ({ id: r._id, name: r.name, location: r.location, price: r.price, status: r.status, amenities: r.amenities, specs: r.specs, owner_name: r.created_by?.full_name }));
  const compactUsers = users.map(u => ({ id: u._id, name: u.full_name, email: u.email, role: u.role === "admin" ? "admin" : (u.role === "staff" ? "chủ phòng" : "khách hàng") }));
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
5. QUAN TRỌNG: Hãy hiểu "staff" đồng nghĩa tuyệt đối với "chủ phòng" / "chủ nhà" / "người cho thuê". Khi khách hỏi về "chủ phòng" hay "top chủ phòng", bạn hãy ngầm hiểu là họ đang tìm kiếm và muốn xếp hạng những User có role là "chủ phòng" (hay staff). Dựa vào số phòng sở hữu từ danh sách Rooms (so sánh \`owner_name\`) để tìm ra ai là người nổi bật nhất. Mọi truy vấn về "chủ phòng" đều tương đương với "staff", KHÔNG ĐƯỢC từ chối trả lời.
6. NẾU người dùng ngỏ ý muốn HỦY PHÒNG ĐANG THUÊ (ví dụ: "tôi muốn hủy phòng" hoặc "hủy phòng của tôi"), hãy đặt cờ \`is_cancel_request: true\` trong kết quả JSON, ngược lại luôn là \`false\`.

Schema:
{
  "reply": "Câu trả lời của bạn, rõ ràng mạch lạc.",
  "suggested_room_ids": ["id1", "id2"], // mảng string chứa ID phòng cần gợi ý, rỗng nếu không có gợi ý.
  "is_cancel_request": false // true or false tuỳ thuộc vào câu hỏi
}
  `;

  try {
    let result = null;
    let fallbackError = null;
    let attempts = GROQ_API_KEYS.length;

    for (let i = 0; i < attempts; i++) {
      if (GROQ_API_KEYS.length === 0) break;
      const apiKey = GROQ_API_KEYS[currentKeyIndex];

      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant. Always output JSON matching the requested schema exactly."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content;
        if (!rawText) throw new Error("No response content received from Groq");
        
        result = JSON.parse(rawText.trim());
        break; // Success, break loop
      } catch (err) {
        console.error(`Groq API Key ở index ${currentKeyIndex} lỗi:`, err.message);
        fallbackError = err;

        if (err.message && (err.message.includes("leaked") || err.message.includes("revoked") || err.message.includes("invalid") || err.message.includes("API key"))) {
          GROQ_API_KEYS.splice(currentKeyIndex, 1);
          if (currentKeyIndex >= GROQ_API_KEYS.length) {
            currentKeyIndex = 0;
          }
        } else {
          currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
        }
      }
    }

    if (!result) {
      throw fallbackError || new Error("All Groq API keys are depleted.");
    }

    let suggestions = [];
    if (Array.isArray(result.suggested_room_ids) && result.suggested_room_ids.length > 0) {
      suggestions = rooms.filter((room) => result.suggested_room_ids.includes(room._id.toString()));
    }

    return {
      reply: result.reply || "Mình chưa có câu trả lời cho vấn đề này.",
      suggestions,
      is_cancel_request: result.is_cancel_request === true,
    };
  } catch (err) {
    console.error("AI Chatbot Error:", err);
    let errorMsg = "Xin lỗi, hệ thống AI hiện đang xử lý khối lượng lớn hoặc quá tải, vui lòng thử lại sau.";
    if (err.message && err.message.includes("limit")) {
      errorMsg = "Lỗi: API Key của bạn đã vượt quá giới hạn sử dụng (Rate limit). Vui lòng thử lại sau ít phút hoặc đổi Key khác.";
    } else if (err.message) {
      errorMsg = `Lỗi hệ thống AI: ${err.message}`;
    }
    return {
      reply: errorMsg,
      suggestions: [],
    };
  }
};
