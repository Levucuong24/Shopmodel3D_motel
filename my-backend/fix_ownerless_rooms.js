import mongoose from "mongoose";
import Room from "./src/modules/room/Room.js";
import User from "./src/modules/user/User.js";

async function fixData() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myhousing_dev");
  
  // Find the first admin
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.log("No admin user found to assign rooms to.");
    process.exit();
  }

  console.log(`Found admin: ${admin.full_name} (${admin._id})`);

  // Find rooms without created_by
  const ownerlessRooms = await Room.find({ 
    $or: [
      { created_by: { $exists: false } },
      { created_by: null }
    ]
  });

  console.log(`Found ${ownerlessRooms.length} ownerless rooms.`);

  for (const room of ownerlessRooms) {
    room.created_by = admin._id;
    await room.save();
    console.log(`Assigned room "${room.name}" to admin.`);
  }

  console.log("Data fix complete.");
  process.exit();
}

fixData().catch(console.error);
