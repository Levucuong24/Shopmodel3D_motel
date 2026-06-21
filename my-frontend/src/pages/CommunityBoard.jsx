import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/authStorage.js";
import "../css/Community.css";

function CommunityBoard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Thảo luận",
    media: ""
  });

  const authToken = getAuthToken();

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = "/api/community";
      if (categoryFilter) url += `?category=${encodeURIComponent(categoryFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      alert("Bạn cần đăng nhập để đăng bài.");
      return;
    }

    try {
      const mediaArray = newPost.media.split(',').map(m => m.trim()).filter(m => m);
      const res = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          media: mediaArray
        })
      });

      if (res.ok) {
        setNewPost({ title: "", content: "", category: "Thảo luận", media: "" });
        setShowForm(false);
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.message || "Lỗi khi đăng bài");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi");
    }
  };

  const handleLike = async (postId) => {
    if (!authToken) {
      alert("Bạn cần đăng nhập để thích bài viết.");
      return;
    }
    try {
      const res = await fetch(`/api/community/${postId}/like`, {
        method: "POST",
        headers: { Authorization: authToken }
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="community-page">
      <div className="community-header">
        <h1>Cộng đồng & Bảng tin</h1>
        <p>Giao lưu, thảo luận và mua bán đồ cũ cùng các cư dân khác.</p>
        <button className="create-post-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Đóng" : "Đăng bài viết mới"}
        </button>
      </div>

      {showForm && (
        <div className="create-post-form">
          <form onSubmit={handlePostSubmit}>
            <input 
              type="text" 
              placeholder="Tiêu đề bài viết..." 
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              required
            />
            <select 
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
            >
              <option value="Thảo luận">Thảo luận</option>
              <option value="Mua bán đồ cũ">Mua bán đồ cũ</option>
              <option value="Tìm bạn ở ghép">Tìm bạn ở ghép</option>
              <option value="Review phòng trọ">Review phòng trọ</option>
            </select>
            <textarea 
              placeholder="Nội dung bài viết..." 
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              required
              rows="4"
            />
            <input 
              type="text" 
              placeholder="Link hình ảnh (cách nhau bằng dấu phẩy)..." 
              value={newPost.media}
              onChange={(e) => setNewPost({...newPost, media: e.target.value})}
            />
            <button type="submit">Đăng bài</button>
          </form>
        </div>
      )}

      <div className="community-filters">
        {["", "Thảo luận", "Mua bán đồ cũ", "Tìm bạn ở ghép", "Review phòng trọ"].map(cat => (
          <button 
            key={cat} 
            className={categoryFilter === cat ? "active" : ""}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat || "Tất cả"}
          </button>
        ))}
      </div>

      <div className="posts-container">
        {loading ? (
          <p>Đang tải bài viết...</p>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <img src={post.user_id?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_id?.full_name || "User")}&background=random`} alt="avatar" />
                <div>
                  <strong>{post.user_id?.full_name || "Người dùng"}</strong>
                  <span className="post-date">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <span className="post-category">{post.category}</span>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content}</p>
              
              {post.media && post.media.length > 0 && (
                <div className="post-media">
                  {post.media.map((url, idx) => (
                    <img key={idx} src={url} alt="media" />
                  ))}
                </div>
              )}

              <div className="post-actions">
                <button className="like-btn" onClick={() => handleLike(post._id)}>
                  ❤️ {post.likes?.length || 0}
                </button>
                <button className="comment-btn">💬 Bình luận</button>
              </div>
            </div>
          ))
        ) : (
          <p>Chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
}

export default CommunityBoard;
