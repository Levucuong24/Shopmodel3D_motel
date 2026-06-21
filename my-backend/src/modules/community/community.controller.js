import CommunityPost from "./CommunityPost.js";
import CommunityComment from "./CommunityComment.js";

// Lấy danh sách bài viết
export const getPosts = async (req, res, next) => {
  try {
    const { category, location } = req.query;
    let query = {};
    if (category) query.category = category;
    if (location) query.location = location;

    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .populate("user_id", "full_name avatar")
      .populate("likes", "full_name");

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết một bài viết kèm bình luận
export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id)
      .populate("user_id", "full_name avatar")
      .populate("likes", "full_name");

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const comments = await CommunityComment.find({ post_id: id })
      .sort({ createdAt: 1 })
      .populate("user_id", "full_name avatar");

    res.json({ post, comments });
  } catch (error) {
    next(error);
  }
};

// Tạo bài viết mới
export const createPost = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để đăng bài" });
    }

    const { title, content, category, location, media } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Vui lòng nhập tiêu đề và nội dung" });
    }

    const post = await CommunityPost.create({
      user_id: req.user.id,
      title,
      content,
      category: category || "Thảo luận",
      location: location || "Chung",
      media: Array.isArray(media) ? media.filter(m => typeof m === 'string' && m.trim() !== '') : [],
    });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate("user_id", "full_name avatar")
      .populate("likes", "full_name");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Thích / Bỏ thích bài viết
export const toggleLike = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thích bài viết" });
    }

    const { id } = req.params;
    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id); // Like
    } else {
      post.likes.splice(index, 1); // Unlike
    }

    await post.save();

    const populatedPost = await CommunityPost.findById(post._id)
      .populate("user_id", "full_name avatar")
      .populate("likes", "full_name");

    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// Tạo bình luận mới
export const createComment = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để bình luận" });
    }

    const { id } = req.params; // post_id
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung bình luận" });
    }

    const comment = await CommunityComment.create({
      post_id: id,
      user_id: req.user.id,
      content,
    });

    const populatedComment = await CommunityComment.findById(comment._id)
      .populate("user_id", "full_name avatar");

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};
