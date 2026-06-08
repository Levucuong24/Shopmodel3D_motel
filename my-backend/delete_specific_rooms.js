import mongoose from "mongoose";
import Room from "./src/modules/room/Room.js";
import SavedRoom from "./src/modules/room/SavedRoom.js";
import Review from "./src/modules/review/Review.js";
import Payment from "./src/modules/payment/Payment.js";
import Contract from "./src/modules/contract/Contract.js";
import ViewingRequest from "./src/modules/viewing/ViewingRequest.js";

// Các từ khóa tên phòng cần xóa (không phân biệt hoa/thường)
const ROOM_NAME_KEYWORDS = [
  "Nhà Sinh viên Tân Xã",
  "Phòng trọ cao cấp Bình Yên",
  "hạnh phúc",
  "khu đông",
];

async function deleteRoomsByName() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myhousing_dev");
  console.log("✅ Kết nối database thành công.\n");

  // Build regex OR query to match any of the keywords (case-insensitive)
  const regexList = ROOM_NAME_KEYWORDS.map(
    (kw) => new RegExp(kw.trim(), "i")
  );

  const targetRooms = await Room.find({ name: { $in: regexList } }).lean();

  if (targetRooms.length === 0) {
    console.log("⚠️  Không tìm thấy phòng nào khớp với danh sách tên đã cho.");
    process.exit(0);
  }

  const roomIds = targetRooms.map((r) => r._id);

  console.log(`🔍 Tìm thấy ${targetRooms.length} phòng sẽ bị xóa:`);
  targetRooms.forEach((r) => console.log(`   • "${r.name}" (ID: ${r._id})`));
  console.log();

  // 1. Xóa Reviews
  const reviewResult = await Review.deleteMany({ room_id: { $in: roomIds } });
  console.log(`🗑  Reviews đã xóa:         ${reviewResult.deletedCount}`);

  // 2. Xóa Payments
  const paymentResult = await Payment.deleteMany({ room_id: { $in: roomIds } });
  console.log(`🗑  Payments đã xóa:        ${paymentResult.deletedCount}`);

  // 3. Xóa ViewingRequests
  const viewingResult = await ViewingRequest.deleteMany({ room_id: { $in: roomIds } });
  console.log(`🗑  ViewingRequests đã xóa: ${viewingResult.deletedCount}`);

  // 4. Xóa Contracts
  const contractResult = await Contract.deleteMany({ room_id: { $in: roomIds } });
  console.log(`🗑  Contracts đã xóa:       ${contractResult.deletedCount}`);

  // 5. Xóa SavedRooms
  const savedResult = await SavedRoom.deleteMany({ room_id: { $in: roomIds } });
  console.log(`🗑  SavedRooms đã xóa:      ${savedResult.deletedCount}`);

  // 6. Xóa chính các Rooms
  const roomResult = await Room.deleteMany({ _id: { $in: roomIds } });
  console.log(`🗑  Rooms đã xóa:           ${roomResult.deletedCount}`);

  console.log("\n✅ Hoàn tất! Tất cả dữ liệu liên quan đã được xóa khỏi database.");
  process.exit(0);
}

deleteRoomsByName().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
