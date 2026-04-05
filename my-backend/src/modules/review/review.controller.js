// src/controllers/review.controller.js
import Review from "./Review.js";

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
