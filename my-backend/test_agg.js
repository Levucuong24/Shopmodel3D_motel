import mongoose from "mongoose";
import Review from "./src/modules/review/Review.js";
import Room from "./src/modules/room/Room.js";
import User from "./src/modules/user/User.js";
import express from "express";

async function testQuery() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myhousing_dev");
  console.log("Connected to MongoDB.");

  // Test 1: Check Reviews
  const reviews = await Review.find().lean();
  console.log("Total Reviews:", reviews.length);
  if (reviews.length > 0) {
    console.log("Sample Review:", reviews[0]);
    console.log("typeof room_id:", typeof reviews[0].room_id);
  }

  // Test 2: Run agg stage 1
  const stage1 = await Review.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$room_id", avgRoomRating: { $avg: "$rating" } } }
  ]);
  console.log("Stage 1 Output:", JSON.stringify(stage1, null, 2));

  // Test 3: Run agg stage 2 (lookup room)
  const stage2 = await Review.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$room_id", avgRoomRating: { $avg: "$rating" } } },
    { $lookup: { from: "rooms", localField: "_id", foreignField: "_id", as: "room" } },
  ]);
  console.log("Stage 2 Count:", stage2.length);
  stage2.forEach((s, idx) => {
    console.log(`Room [${idx}] ID: ${s._id}, HasRoomData: ${s.room.length > 0}`);
    if (s.room.length > 0) {
      console.log(`Room [${idx}] Creator: ${s.room[0].created_by}, Approval: ${s.room[0].approval_status}`);
    }
  });

  // Full Pipeline
  const topLandlords = await Review.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$room_id", avgRoomRating: { $avg: "$rating" } } },
    { $lookup: { from: "rooms", localField: "_id", foreignField: "_id", as: "room" } },
    { $unwind: "$room" },
    { $match: { "room.created_by": { $exists: true } } },
    {
      $group: {
        _id: "$room.created_by",
        avgRating: { $avg: "$avgRoomRating" },
        roomCount: { $sum: 1 }
      }
    },
    { $sort: { avgRating: -1 } },
    { $limit: 5 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "landlord" } },
    { $unwind: "$landlord" }
  ]);
  const fs = await import('fs');
  fs.writeFileSync('debug_agg_results.json', JSON.stringify({ stage2, topLandlords }, null, 2));
  console.log("Results written to debug_agg_results.json");
  process.exit();
}

testQuery().catch(console.error);
