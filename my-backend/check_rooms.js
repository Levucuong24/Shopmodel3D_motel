import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./src/modules/room/Room.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myhousing_dev");
  const rooms = await Room.find();
  for (const r of rooms) {
    console.log(`ID: ${r._id}, Name: ${r.name}, Location: ${r.location}`);
  }
  process.exit(0);
}
run().catch(console.error);
