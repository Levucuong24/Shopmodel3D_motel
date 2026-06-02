import React, { useState, useEffect, useRef } from "react";
import "../css/NewPage.css";
import Footer from "../components/layout/Footer";
import Chatbot from "../components/chatbot/Chatbot";
import { getAuthToken, getUserData, getUserId } from "../utils/authStorage.js";
import { Link, useNavigate } from "react-router-dom";

function NewPage() {
  const navigate = useNavigate();
  const token = getAuthToken();
  const currentUser = getUserData();
  const currentUserId = getUserId();

  // Tab State
  const [activeTab, setActiveTab] = useState("roommates"); // "roommates", "news", "inbox"

  // Data States
  const [posts, setPosts] = useState([]);
  const [rentedRooms, setRentedRooms] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [campusFilter, setCampusFilter] = useState("");

  // Post Modal States
  const [showModal, setShowModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Detailed view & Chat States
  const [activePost, setActivePost] = useState(null); // When viewing detailed post + chat
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [activePartner, setActivePartner] = useState(null); // The other user in current chat
  const [ownerInquiries, setOwnerInquiries] = useState([]); // List of users messaging the owner for active post
  const [pollingActive, setPollingActive] = useState(false);

  // Ref for auto-scrolling chat
  const chatContainerRef = useRef(null);

  // Static News Data
  const newFeatures = [
    {
      id: 1,
      tag: "Feature",
      title: "Mô Hình Tương Tác 3D Nâng Cao",
      desc: "Hệ thống vừa cập nhật các mô hình 3D phòng trọ có độ phân giải cao hơn, tích hợp xem lát cắt phòng (floor plan layout) trực quan.",
      date: "02 Tháng 6, 2026",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      tag: "Update",
      title: "Tích Hợp Bản Đồ Tìm Kiếm Mới",
      desc: "Giờ đây bạn có thể tìm kiếm các phòng trọ xung quanh trường Đại Học FPT bằng giao diện Bản Đồ Số tích hợp chỉ đường vô cùng tiện lợi.",
      date: "30 Tháng 5, 2026",
      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      tag: "Event",
      title: "Ưu Đãi Đặt Phòng Cho Tân Sinh Viên",
      desc: "Nhập mã SVFPT2026 khi tiến hành thanh toán cọc trên hệ thống để được giảm ngay 10% tháng thuê phòng đầu tiên.",
      date: "28 Tháng 5, 2026",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Fetch Roommate Posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/roommates/posts");
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching roommate posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Inbox Inquiries
  const fetchInquiries = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/roommates/inquiries", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries(data);
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    }
  };

  // Fetch Rented Rooms for Modal
  const fetchRentedRooms = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/roommates/rented-rooms", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (res.ok) {
        setRentedRooms(data);
        if (data.length > 0) {
          setSelectedRoomId(data[0]._id);
        }
      }
    } catch (err) {
      console.error("Error fetching rented rooms:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (token) {
      fetchInquiries();
    }
  }, [token]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Polling for active chat messages
  useEffect(() => {
    let intervalId;
    if (activePost && activePartner && pollingActive) {
      const fetchChatMessages = async () => {
        try {
          const partnerParam = activePartner ? `?otherUserId=${activePartner._id}` : "";
          const res = await fetch(`/api/roommates/messages/${activePost._id}${partnerParam}`, {
            headers: { Authorization: token },
          });
          if (res.ok) {
            const data = await res.json();
            setMessages(data);
          }
        } catch (err) {
          console.error("Error polling messages:", err);
        }
      };

      fetchChatMessages();
      intervalId = setInterval(fetchChatMessages, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activePost, activePartner, pollingActive, token]);

  // Handle Open Create Ad Modal
  const handleOpenAdModal = () => {
    if (!token) {
      alert("Vui lòng đăng nhập để sử dụng chức năng này");
      navigate("/login");
      return;
    }
    setModalError("");
    setModalSuccess("");
    setPostTitle("");
    setPostContent("");
    fetchRentedRooms();
    setShowModal(true);
  };

  // Handle Submit Roommate Post
  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!selectedRoomId) {
      setModalError("Vui lòng chọn phòng trọ bạn đã thuê");
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) {
      setModalError("Vui lòng nhập tiêu đề và nội dung mô tả");
      return;
    }

    try {
      const res = await fetch("/api/roommates/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          room_id: selectedRoomId,
          title: postTitle,
          content: postContent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalSuccess("Đăng bài thành công!");
        setPostTitle("");
        setPostContent("");
        fetchPosts();
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      } else {
        setModalError(data.message || "Đã xảy ra lỗi khi đăng bài");
      }
    } catch (err) {
      setModalError("Lỗi hệ thống, vui lòng thử lại sau");
    }
  };

  // Open Chat window for a post
  const handleOpenChat = async (post) => {
    if (!token) {
      alert("Vui lòng đăng nhập để nhắn tin");
      navigate("/login");
      return;
    }

    setActivePost(post);
    setMessages([]);
    setNewMessageText("");

    const isOwner = post.user_id._id === currentUserId;

    if (isOwner) {
      // Owner: need to fetch all inquiries for this post first to see who messaged
      try {
        const res = await fetch("/api/roommates/inquiries", {
          headers: { Authorization: token },
        });
        if (res.ok) {
          const data = await res.json();
          // Filter inquiries related to this post
          const filtered = data.filter((item) => item.post._id === post._id);
          setOwnerInquiries(filtered);
          if (filtered.length > 0) {
            // Select the first conversation by default
            setActivePartner(filtered[0].otherUser);
            setPollingActive(true);
          } else {
            setActivePartner(null);
            setPollingActive(false);
          }
        }
      } catch (err) {
        console.error("Error loading inquiries for owner:", err);
      }
    } else {
      // Normal user: partner is the post owner
      setActivePartner(post.user_id);
      setPollingActive(true);
    }
  };

  // Send Message
  const handleSendMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activePost || !activePartner) return;

    try {
      const body = {
        post_id: activePost._id,
        message: newMessageText,
      };

      // If owner is sending, specify who they are replying to
      const isOwner = activePost.user_id._id === currentUserId;
      if (isOwner) {
        body.reply_to = activePartner._id;
      }

      const res = await fetch("/api/roommates/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setNewMessageText("");
        fetchInquiries(); // refresh inbox sidebar details
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Inbox conversion select
  const handleSelectInquiry = (inquiry) => {
    setActivePost(inquiry.post);
    setActivePartner(inquiry.otherUser);
    setPollingActive(true);
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const campusMatch = !campusFilter || (post.room_id?.location || "").toLowerCase().includes(campusFilter.toLowerCase());
    return titleMatch && campusMatch;
  });

  return (
    <div className="new-page-container">
      {/* Sub Navbar Tabs */}
      <div className="new-sub-navbar">
        <button
          className={activeTab === "roommates" ? "active" : ""}
          onClick={() => {
            setActiveTab("roommates");
            setActivePost(null);
          }}
        >
          🔑 Tìm Ở Ghép
        </button>
        <button
          className={activeTab === "news" ? "active" : ""}
          onClick={() => {
            setActiveTab("news");
            setActivePost(null);
          }}
        >
          📢 Bản Tin & Sự Kiện
        </button>
        {token && (
          <button
            className={activeTab === "inbox" ? "active" : ""}
            onClick={() => {
              setActiveTab("inbox");
              setActivePost(null);
              fetchInquiries();
            }}
          >
            ✉️ Hộp Thư Ở Ghép
          </button>
        )}
      </div>

      {/* RENDER TAB 1: ROOMMATE MARKETPLACE */}
      {activeTab === "roommates" && !activePost && (
        <>
          <div className="new-hero roommates-bg">
            <div className="new-hero-content animate-fade-in">
              <span className="hero-tag">Tìm Người Ở Ghép</span>
              <h1>CHIA SẺ KHÔNG GIAN - CHIA SẺ CHI PHÍ</h1>
              <p>Khám phá các cơ hội tìm bạn ở ghép uy tín, xem phòng 3D trực quan và liên hệ trực tiếp.</p>
              <button className="post-ad-btn" onClick={handleOpenAdModal}>
                ➕ Đăng Tin Tìm Ở Ghép
              </button>
            </div>
          </div>

          <div className="new-content-wrapper">
            {/* Filter section */}
            <div className="market-filter-bar">
              <input
                type="text"
                placeholder="Tìm tiêu đề, nội dung phòng trọ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả khu vực</option>
                <option value="Xa Thach Hoa">Thạch Thất (Thạch Hòa)</option>
                <option value="Xa Tan Xa">Tân Xã</option>
                <option value="Xa Binh Yen">Bình Yên</option>
                <option value="Ngu Hanh Son">Đà Nẵng</option>
                <option value="Quan 9">TP. HCM (Quận 9)</option>
                <option value="Ninh Kieu">Cần Thơ</option>
              </select>
            </div>

            {loading ? (
              <div className="loading-spinner">Đang tải danh sách bài đăng...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có bài đăng tìm ở ghép nào phù hợp với bộ lọc của bạn.</p>
              </div>
            ) : (
              <div className="roommate-list-grid">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="roommate-card">
                    <div className="roommate-card-header">
                      <div className="creator-profile">
                        <img
                          src={
                            post.user_id.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_id.full_name)}&background=0f172a&color=ffffff`
                          }
                          alt={post.user_id.full_name}
                          className="creator-avatar"
                        />
                        <div>
                          <h4>{post.user_id.full_name}</h4>
                          <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                      <span className="campus-badge">{post.room_id?.location || "Khu vực"}</span>
                    </div>

                    <div className="roommate-card-body">
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>

                      {post.room_id && (
                        <div className="associated-room-card">
                          <img
                            src={post.room_id.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80"}
                            alt={post.room_id.name}
                          />
                          <div className="associated-room-info">
                            <h5>{post.room_id.name}</h5>
                            <p className="price">{post.room_id.price.toLocaleString("vi-VN")} đ/tháng</p>
                            <p className="specs">{post.room_id.specs?.area || 0} m² • {post.room_id.specs?.layout || "Chưa cập nhật"}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="roommate-card-actions">
                      {post.room_id && (
                        <Link to={`/product/${post.room_id._id}`} className="view-detail-link">
                          Xem chi tiết phòng 3D
                        </Link>
                      )}
                      <button className="chat-action-btn" onClick={() => handleOpenChat(post)}>
                        💬 Nhắn tin ở ghép
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* DETAIL POST & CHAT SCREEN */}
      {activeTab === "roommates" && activePost && (
        <div className="chat-detail-view-container">
          <div className="back-bar">
            <button className="back-btn" onClick={() => setActivePost(null)}>
              ← Quay lại danh sách
            </button>
          </div>

          <div className="chat-detail-grid">
            {/* Left: Post & Room Details */}
            <div className="post-detail-pane">
              <div className="post-info-section">
                <span className="post-detail-date">
                  Đăng ngày: {new Date(activePost.createdAt).toLocaleDateString("vi-VN")}
                </span>
                <h2>{activePost.title}</h2>
                <div className="post-author-box">
                  <img
                    src={
                      activePost.user_id.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(activePost.user_id.full_name)}&background=0f172a&color=ffffff`
                    }
                    alt={activePost.user_id.full_name}
                  />
                  <div>
                    <strong>{activePost.user_id.full_name}</strong>
                    <p>{activePost.user_id.phone || "Chưa cập nhật số điện thoại"}</p>
                  </div>
                </div>
                <div className="post-content-text">
                  <p>{activePost.content}</p>
                </div>
              </div>

              {activePost.room_id && (
                <div className="room-info-section">
                  <h3>Thông tin phòng trọ chia sẻ</h3>
                  <div className="room-detail-preview">
                    <img
                      src={activePost.room_id.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"}
                      alt={activePost.room_id.name}
                    />
                    <div className="room-detail-preview-body">
                      <h4>{activePost.room_id.name}</h4>
                      <p className="price">Giá thuê: {activePost.room_id.price.toLocaleString("vi-VN")} đ/tháng</p>
                      <p className="address">📍 {activePost.room_id.location}</p>
                      <div className="specs-row">
                        <span>Diện tích: {activePost.room_id.specs?.area || 0} m²</span>
                        <span>Loại: {activePost.room_id.specs?.layout || "Chưa cập nhật"}</span>
                      </div>
                      <Link to={`/product/${activePost.room_id._id}`} className="view-3d-button">
                        🕹️ Trải nghiệm mô hình 3D phòng
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Integrated Chat Window */}
            <div className="chat-window-pane">
              {/* If owner: show inquiries list of this post to switch conversation */}
              {activePost.user_id._id === currentUserId && (
                <div className="owner-chat-inquiries-sidebar">
                  <h5>Tin nhắn liên quan đến bài đăng</h5>
                  {ownerInquiries.length === 0 ? (
                    <p className="no-inquiries-text">Chưa có ai nhắn tin cho bài đăng này của bạn.</p>
                  ) : (
                    <div className="inquiry-list">
                      {ownerInquiries.map((inq) => (
                        <button
                          key={inq.otherUser._id}
                          className={`inquiry-item ${activePartner?._id === inq.otherUser._id ? "active" : ""}`}
                          onClick={() => {
                            setActivePartner(inq.otherUser);
                            setPollingActive(true);
                          }}
                        >
                          <img
                            src={
                              inq.otherUser.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(inq.otherUser.full_name)}&background=0f172a&color=ffffff`
                            }
                            alt={inq.otherUser.full_name}
                          />
                          <span>{inq.otherUser.full_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat messages screen */}
              {activePartner ? (
                <div className="chat-box-display">
                  <div className="chat-header">
                    <img
                      src={
                        activePartner.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.full_name)}&background=0f172a&color=ffffff`
                      }
                      alt={activePartner.full_name}
                    />
                    <div>
                      <h5>{activePartner.full_name}</h5>
                      <span>Nhắn tin về bài đăng ở ghép</span>
                    </div>
                  </div>

                  <div className="chat-messages-container" ref={chatContainerRef}>
                    {messages.length === 0 ? (
                      <div className="chat-empty-state">
                        <p>Gửi tin nhắn đầu tiên để bắt đầu trò chuyện tìm người ở ghép!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`message-bubble ${msg.sender_id === currentUserId ? "outgoing" : "incoming"}`}
                        >
                          <div className="bubble-text">{msg.message}</div>
                          <span className="bubble-time">
                            {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <form className="chat-input-bar" onSubmit={handleSendMessageSubmit}>
                    <input
                      type="text"
                      placeholder="Nhập nội dung tin nhắn..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                    />
                    <button type="submit">Gửi</button>
                  </form>
                </div>
              ) : (
                <div className="select-conversation-prompt">
                  <p>Chọn một cuộc trò chuyện từ danh sách bên trái để phản hồi tin nhắn ở ghép.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: ANNOUNCEMENTS */}
      {activeTab === "news" && (
        <div className="new-content-wrapper">
          <div className="new-section-title">
            <h2>Bản Tin & Sự Kiện Nổi Bật</h2>
            <div className="title-bar"></div>
          </div>

          <div className="new-grid">
            {newFeatures.map((item) => (
              <div key={item.id} className="new-card">
                <div className="new-card-image">
                  <img src={item.image} alt={item.title} />
                  <span className={`new-tag ${item.tag.toLowerCase()}`}>{item.tag}</span>
                </div>
                <div className="new-card-body">
                  <span className="new-date">{item.date}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <a href="#read-more" className="read-more-btn">
                    Xem chi tiết
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="new-newsletter-box">
            <div className="newsletter-content">
              <h3>Đừng bỏ lỡ các cập nhật mới</h3>
              <p>Đăng ký nhận thông báo email để luôn nhận được tin tức về các phòng trọ đẹp nhất và mã giảm giá sớm nhất.</p>
              <div className="newsletter-input-group">
                <input type="email" placeholder="Nhập email của bạn..." />
                <button className="newsletter-submit">Đăng Ký</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: INBOX MESSAGES */}
      {activeTab === "inbox" && (
        <div className="inbox-page-wrapper">
          <div className="new-section-title">
            <h2>Hộp Thư Tin Nhắn Ở Ghép</h2>
            <div className="title-bar"></div>
          </div>

          <div className="inbox-layout-grid">
            {/* Inbox Sidebar List */}
            <div className="inbox-sidebar-pane">
              <h3>Các cuộc hội thoại</h3>
              {inquiries.length === 0 ? (
                <p className="empty-inbox-text">Bạn chưa có cuộc trò chuyện nào.</p>
              ) : (
                <div className="inquiry-list">
                  {inquiries.map((inq) => {
                    const key = `${inq.post._id}_${inq.otherUser._id}`;
                    return (
                      <button
                        key={key}
                        className={`inquiry-card-item ${
                          activePost?._id === inq.post._id && activePartner?._id === inq.otherUser._id
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleSelectInquiry(inq)}
                      >
                        <img
                          src={
                            inq.otherUser.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(inq.otherUser.full_name)}&background=0f172a&color=ffffff`
                          }
                          alt={inq.otherUser.full_name}
                        />
                        <div className="inquiry-card-info">
                          <div className="card-top-row">
                            <strong>{inq.otherUser.full_name}</strong>
                            <span>{new Date(inq.updatedAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <p className="post-topic">Bài: {inq.post.title}</p>
                          <p className="last-message-preview">{inq.lastMessage}</p>
                          {inq.isOwner && <span className="owner-badge">Của tôi</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inbox Messages Area */}
            <div className="inbox-messages-pane">
              {activePost && activePartner ? (
                <div className="chat-box-display">
                  <div className="chat-header">
                    <div className="header-info-wrapper">
                      <img
                        src={
                          activePartner.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.full_name)}&background=0f172a&color=ffffff`
                        }
                        alt={activePartner.full_name}
                      />
                      <div>
                        <h5>{activePartner.full_name}</h5>
                        <span>Liên quan đến bài đăng ở ghép: {activePost.title}</span>
                      </div>
                    </div>
                    {activePost.room_id && (
                      <Link to={`/product/${activePost.room_id}`} className="view-room-link-header">
                        Xem phòng 3D
                      </Link>
                    )}
                  </div>

                  <div className="chat-messages-container" ref={chatContainerRef}>
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`message-bubble ${msg.sender_id === currentUserId ? "outgoing" : "incoming"}`}
                      >
                        <div className="bubble-text">{msg.message}</div>
                        <span className="bubble-time">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <form className="chat-input-bar" onSubmit={handleSendMessageSubmit}>
                    <input
                      type="text"
                      placeholder="Nhập nội dung tin nhắn..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                    />
                    <button type="submit">Gửi</button>
                  </form>
                </div>
              ) : (
                <div className="select-conversation-prompt">
                  <div className="prompt-icon">✉️</div>
                  <p>Chọn một đoạn hội thoại từ danh sách bên trái để gửi tin nhắn thỏa thuận ở ghép.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE AD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3>Đăng Tin Tìm Người Ở Ghép</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit}>
              {modalError && <div className="modal-error-message">{modalError}</div>}
              {modalSuccess && <div className="modal-success-message">{modalSuccess}</div>}

              <div className="form-group">
                <label>Chọn phòng trọ bạn đã thuê</label>
                {rentedRooms.length === 0 ? (
                  <p className="no-rooms-warning">
                    Bạn chưa có hợp đồng thuê phòng nào ở trạng thái "active". Vui lòng thanh toán cọc phòng trước khi sử dụng tính năng tìm ở ghép.
                  </p>
                ) : (
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="modal-select"
                  >
                    {rentedRooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name} - {room.location} ({room.price.toLocaleString("vi-VN")} đ/tháng)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Tiêu đề bài đăng</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tìm nam ở ghép chung phòng trọ gần campus FPT..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nội dung mô tả chi tiết</label>
                <textarea
                  placeholder="Mô tả chi tiết phòng trọ, yêu cầu đối với người ở ghép (sạch sẽ, không hút thuốc, chia tiền điện nước...)"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="modal-textarea"
                  rows="5"
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="submit-btn" disabled={rentedRooms.length === 0}>
                  Đăng Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <Chatbot />
    </div>
  );
}

export default NewPage;
