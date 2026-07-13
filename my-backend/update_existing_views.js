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

  for (const room of rooms) {
    const randomViews = Math.floor(Math.random() * 400) + 1300; // Random between 1300 and 1700
    room.views = randomViews;
    await room.save();
    console.log(`Updated room "${room.name}" with ${randomViews} views.`);
  }

  console.log("All rooms updated with fake views.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
