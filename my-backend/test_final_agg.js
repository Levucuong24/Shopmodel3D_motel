import mongoose from "mongoose";
import Review from "./src/modules/review/Review.js";
import User from "./src/modules/user/User.js";
import Room from "./src/modules/room/Room.js";

async function testFinalAgg() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myhousing_dev");
  console.log("Connected to MongoDB.");

  const topLandlords = await Review.aggregate([
      { $match: { status: "approved" } },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "_id",
          as: "room"
        }
      },
      { $unwind: "$room" },
      { $match: { "room.created_by": { $exists: true } } },
      {
        $group: {
          _id: "$room.created_by",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          roomIds: { $addToSet: "$room_id" }
        }
      },
      {
        $project: {
          _id: 1,
          avgRating: 1,
          totalReviews: 1,
          roomCount: { $size: "$roomIds" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "landlord"
        }
      },
      { $unwind: "$landlord" },
      { $match: { "landlord.role": "staff" } },
      { $sort: { avgRating: -1, totalReviews: -1 } },
      { $limit: 5 }
    ]);

  console.log("Results found:", topLandlords.length);
  console.log("Top Landlords:", JSON.stringify(topLandlords, null, 2));
  process.exit();
}

testFinalAgg().catch(console.error);
