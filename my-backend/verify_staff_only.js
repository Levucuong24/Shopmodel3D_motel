import mongoose from "mongoose";
import Review from "./src/modules/review/Review.js";
import User from "./src/modules/user/User.js";
import Room from "./src/modules/room/Room.js";

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myhousing_dev");
  const topLandlords = await Review.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$room_id", avgRoomRating: { $avg: "$rating" } } },
    { $lookup: { from: "rooms", localField: "_id", foreignField: "_id", as: "room" } },
    { $unwind: "$room" },
    { $match: { "room.created_by": { $exists: true } } },
    { $group: { _id: "$room.created_by", avgRating: { $avg: "$avgRoomRating" }, roomCount: { $sum: 1 } } },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "landlord" } },
    { $unwind: "$landlord" },
    { $match: { "landlord.role": "staff" } },
    { $sort: { avgRating: -1 } },
    { $limit: 5 }
  ]);
  console.log("Top Staff Landlords:", JSON.stringify(topLandlords, null, 2));
  process.exit();
}
run().catch(console.error);
