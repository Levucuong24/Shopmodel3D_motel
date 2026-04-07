// src/controllers/review.controller.js
import Review from "./Review.js";

export const getTopLandlords = async (req, res, next) => {
  try {
    try {
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
        { $group: {
            _id: "$room.created_by",
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 }
        }},
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
        { $limit: 5 },
        { $project: {
            _id: 1,
            avgRating: 1,
            totalReviews: 1,
            "landlord.full_name": 1,
            "landlord.avatar": 1
        }}
      ]);
      res.json(topLandlords);
    } catch (error) {
      console.error("DEBUG AGG ERROR:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  } catch (error) {
    next(error);
  }
};

export const getReviewsByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({
      room_id: roomId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .populate("user_id", "full_name email avatar");

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để đánh giá" });
    }

    const { room_id, rating, content } = req.body;

    if (!room_id || !rating || !content?.trim()) {
      return res.status(400).json({ message: "Thiếu nội dung đánh giá" });
    }

    const review = await Review.create({
      user_id: req.user.id,
      room_id,
      rating,
      content: content.trim(),
      status: "approved",
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    res.json(review);
  } catch (error) {
    next(error);
  }
};
