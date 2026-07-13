import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./src/modules/room/Room.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myhousing_dev";

async function run() {
  console.log("Connecting to Database...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.");

  const rooms = await Room.find();
  console.log(`Found ${rooms.length} rooms to update.`);

  if (rooms.length === 0) {
    console.log("No rooms found.");
    process.exit(0);
  }

  // Identify high-view rooms vs normal-view rooms
  // Tân Xã & Hòa Lạc are high views
  const highRooms = [];
  const normalRooms = [];

  for (const room of rooms) {
    const loc = (room.location || "").toLowerCase();
    if (loc.includes("tân xã") || loc.includes("hòa lạc")) {
      highRooms.push(room);
    } else {
      normalRooms.push(room);
    }
  }

  console.log(`High rooms: ${highRooms.map(r => r.name).join(", ")}`);
  console.log(`Normal rooms: ${normalRooms.map(r => r.name).join(", ")}`);

  // Target distributions:
  // High room views: ~340, 350, 360 (Average: ~350)
  // Normal room views: ~270, 280 (Average: ~275)
  // Total: 340 + 350 + 360 + 270 + 280 = 1600.
  const highViewValues = [340, 350, 360];
  const normalViewValues = [270, 280];

  let totalAssigned = 0;
  
  // Assign high rooms
  highRooms.forEach((room, index) => {
    const views = highViewValues[index % highViewValues.length];
    room.views = views;
    totalAssigned += views;
  });

  // Assign normal rooms
  normalRooms.forEach((room, index) => {
    const views = normalViewValues[index % normalViewValues.length];
    room.views = views;
    totalAssigned += views;
  });

  // Adjust to make the total exactly 1600
  const diff = 1600 - totalAssigned;
  if (diff !== 0 && rooms.length > 0) {
    rooms[0].views += diff;
  }

  // Save all rooms
  let finalTotal = 0;
  for (const room of rooms) {
    await room.save();
    console.log(`Updated room "${room.name}" (${room.location}) -> Views: ${room.views}`);
    finalTotal += room.views;
  }

  console.log(`\nVerification:`);
  console.log(`Total views: ${finalTotal} (Target: 1600)`);
  console.log("All rooms updated successfully.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
