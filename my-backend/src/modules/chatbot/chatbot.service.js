import { GoogleGenAI } from "@google/genai";
import Contract from "../contract/Contract.js";
import Payment from "../payment/Payment.js";
import Review from "../review/Review.js";
import Room from "../room/Room.js";
import SavedRoom from "../room/SavedRoom.js";
import User from "../user/User.js";
import ViewingRequest from "../viewing/ViewingRequest.js";
import { findFaqReply } from "./chatbotFaq.js";

export const chatbotReply = async (text) => {
  const query = (text || "").trim();

  if (!query) {
    return {
      reply:
        "Ban hay nhap cau hoi cu the ve phong, gia, lich xem, danh gia, thanh toan, hop dong hoac cach dung website de minh ho tro.",
      suggestions: [],
    };
  }

  const rooms = await Room.find().lean();
  const faqReply = findFaqReply({ query, rooms });

  if (faqReply) {
    return {
      reply: faqReply.reply,
      suggestions: faqReply.suggestions || [],
    };
  }

  // Fallback AI/RAG for questions not covered by the fixed FAQ bank.
  const [reviews, payments, viewings, users, contracts, savedRooms] = await Promise.all([
    Review.find({ status: "approved" }).populate("room_id", "name location").populate("user_id", "full_name").lean(),
    Payment.find().populate("room_id", "name location").lean(),
    ViewingRequest.find().populate("room_id", "name location").populate("user_id", "full_name email phone").lean(),
    User.find().select("-password").lean(),
    Contract.find().populate("room_id", "name location").populate("user_id", "full_name email").lean(),
    SavedRoom.find().lean(),
  ]);

  const publicRooms = rooms.filter((room) => room.approval_status === "approved");
  const visibleRooms = publicRooms.length > 0 ? publicRooms : rooms;
  const availableRooms = visibleRooms.filter((room) => room.status === "available");
  const reservedRooms = visibleRooms.filter((room) => room.status === "reserved");
  const rentedRooms = visibleRooms.filter((room) => room.status === "rented");
  const successPayments = payments.filter((payment) => payment.status === "success");
  const pendingViewings = viewings.filter((item) => item.status === "pending");
  const activeContracts = contracts.filter((contract) => contract.status === "active");
  const customerCount = users.filter((user) => user.role === "customer").length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const totalRevenue = successPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pendingPayments = payments.length - successPayments.length;

  const dataContext = `
He thong quan ly phong hien tai co so lieu sau:
- Tong so phong public: ${visibleRooms.length} (${availableRooms.length} trong, ${reservedRooms.length} coc, ${rentedRooms.length} dang thue)
- So nguoi dung: ${customerCount} khach hang, ${adminCount} admin
- Doanh thu: ${totalRevenue.toLocaleString("vi-VN")} VND tu ${successPayments.length} giao dich thanh cong
- Giao dich dang cho xu ly: ${pendingPayments}
- Danh gia da duyet: ${reviews.length}
- Lich xem dang cho duyet: ${pendingViewings.length} tren tong ${viewings.length} lich xem
- Hop dong dang hieu luc: ${activeContracts.length}
- So luot luu phong: ${savedRooms.length}

Danh sach phong trong:
${availableRooms
  .map(
    (room) =>
      `[Phong ID: ${room._id}] ${room.name} tai ${room.location || "chua cap nhat"}, gia: ${
        room.price ? room.price.toLocaleString("vi-VN") : "lien he"
      }d, tien ich: ${(room.amenities || []).join(", ")}`
  )
  .join("\n")}

Danh sach review noi bat:
${reviews
  .slice(-5)
  .map((review) => `- Phong ${review.room_id?.name}: ${review.rating} sao - "${review.comment}"`)
  .join("\n")}
  `.trim();

  const prompt = `
Ban la AI chatbot cham soc khach hang cho website cho thue phong.

Du lieu he thong:
"""
${dataContext}
"""

Nguoi dung hoi: "${query}"

Yeu cau:
1. Tra loi bang tieng Viet, ngan gon, dung du lieu co san.
2. Neu cau hoi lien quan den phong, co the goi y toi da 3 phong tu danh sach phong trong.
3. Phai tra ve dung JSON theo schema bat buoc.

Schema bat buoc:
{
  "reply": "Noi dung tra loi",
  "suggested_room_ids": ["id1", "id2"]
}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
      suggestions = visibleRooms.filter((room) => result.suggested_room_ids.includes(room._id.toString()));
    } else {
      suggestions = availableRooms.slice(0, 3);
    }

    return {
      reply: result.reply || "Minh chua tong hop duoc cau tra loi luc nay.",
      suggestions,
    };
  } catch (err) {
    console.error("AI Chatbot Error:", err);
    return {
      reply:
        "FAQ co dinh van dang chay, nhung AI fallback hien chua phan hoi duoc. Ban can kiem tra GEMINI_API_KEY hoac ket noi toi dich vu AI.",
      suggestions: availableRooms.slice(0, 3),
    };
  }
};
