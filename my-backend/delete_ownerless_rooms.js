import mongoose from "mongoose";
import Room from "./src/modules/room/Room.js";

async function deleteOwnerlessRooms() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myhousing_dev");

  // Find rooms without created_by
  const ownerlessRooms = await Room.find({
    $or: [
      { created_by: { $exists: false } },
      { created_by: null }
    ]
  });

  console.log(`Tìm thấy ${ownerlessRooms.length} phòng không có chủ phòng.`);

  if (ownerlessRooms.length === 0) {
    console.log("Không có phòng nào cần xóa.");
    process.exit(0);
  }

  for (const room of ownerlessRooms) {
    console.log(`Đang xóa phòng: "${room.name}" (ID: ${room._id})`);
  }

  const result = await Room.deleteMany({
    $or: [
      { created_by: { $exists: false } },
      { created_by: null }
    ]
  });

  console.log(`\n✅ Đã xóa thành công ${result.deletedCount} phòng không có chủ phòng khỏi database.`);
  process.exit(0);
}

deleteOwnerlessRooms().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
