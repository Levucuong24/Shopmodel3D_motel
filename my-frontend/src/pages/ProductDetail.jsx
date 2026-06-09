import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import Chatbot from "../components/chatbot/Chatbot";
import NotFound from "./NotFound.jsx";
import PaymentModal from "../components/payment/PaymentModal";
import { getAuthToken, getUserData, getUserRole } from "../utils/authStorage.js";
import { formatPriceByUnit, formatRentalDuration } from "../utils/rentalFormat.js";
import "../css/ProductDetail.css";

const StudentHouse3D = lazy(() => import("../components/3d/StudentHouse3D"));

const ThreeDLoader = () => (
  <div className="threed-loader-container">
    <div className="threed-loader-spinner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="threed-spinner-icon">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    </div>
    <span className="threed-loader-text">Đang tải mô hình 3D...</span>
  </div>
);

const fallbackImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1964&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop",
];

const roomStatusLabel = {
  available: "Còn phòng",
  reserved: "Đã được cọc",
  rented: "Hết phòng",
};

const roomStatusClass = {
  available: "status-available",
  reserved: "status-reserved",
  rented: "status-rented",
};

function ProductDetail() {
  const { id } = useParams();
  const authToken = getAuthToken();
  const storedUser = getUserData();
  const userRole = getUserRole();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("static");
  const [showPayment, setShowPayment] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [rentalDurationValue, setRentalDurationValue] = useState(1);
  const [mainImage, setMainImage] = useState(fallbackImages[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [appointmentForm, setAppointmentForm] = useState({
    full_name: storedUser?.full_name || "",
    phone: storedUser?.phone || "",
    scheduled_at: "",
    note: "",
  });
  const [appointmentSubmitting, setAppointmentSubmitting] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(`/api/rooms/${id}`, {
      headers: authToken ? { Authorization: authToken } : {}
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không thể tìm thấy phòng");
        }
        return res.json();
      })
      .then((data) => {
        if (data && (data.message || data.error || !data._id)) {
          setProduct(null);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setReviewsLoading(true);

    fetch(`/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setReviewsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setReviewsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (authToken) {
      fetch("/api/users/me", { headers: { Authorization: authToken } })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.saved_rooms) {
            const saved = data.saved_rooms.some((room) => room._id === id || room === id);
            setIsSaved(saved);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [id, authToken]);

  const images = product?.images?.length ? product.images : fallbackImages;
  const landlordPhone = product?.created_by?.phone || "Đang cập nhật";
  const landlordName = product?.created_by?.full_name || "chủ nhà";
  const landlordRoomCount = Number(product?.owner_room_count || 0);
  const canCallLandlord = Boolean(product?.created_by?.phone);

  useEffect(() => {
    setMainImage(images[0]);
  }, [id, product]);

  useEffect(() => {
    const callButton = document.querySelector(".call-btn");
    if (!callButton) return;

    callButton.textContent = `📞 Gọi chủ nhà: ${landlordPhone}`;
    callButton.title = `${landlordName} hiện có ${landlordRoomCount} phòng đã đăng.`;
    callButton.disabled = !canCallLandlord;
    callButton.style.opacity = canCallLandlord ? "1" : "0.6";
    callButton.style.cursor = canCallLandlord ? "pointer" : "not-allowed";
    callButton.onclick = () => {
      if (canCallLandlord) {
        window.location.href = `tel:${product.created_by.phone}`;
      }
    };

    return () => {
      callButton.onclick = null;
    };
  }, [canCallLandlord, landlordName, landlordPhone, landlordRoomCount, product]);

  const refreshReviews = async () => {
    const response = await fetch(`/api/reviews/${id}`);
    const data = await response.json();
    setReviews(Array.isArray(data) ? data : []);
  };

  const handleOpenPayment = async () => {
    if (!authToken) {
      alert("Bạn cần đăng nhập để đặt cọc giữ phòng!");
      return;
    }
    
    if (!product) return;

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: id,
          rental_duration_value: rentalDurationValue,
          customer_name: storedUser?.full_name || "",
          customer_email: storedUser?.email || "",
          user_id: storedUser?._id,
          payment_type: "deposit",
          payment_method: "BANK_QR",
          note: `Đặt cọc phòng ${product.name}`,
        }),
      });
      const data = await response.json();
      setCurrentPayment(data);
      setShowPayment(true);
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Không thể khởi tạo thanh toán");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!authToken) {
      alert("Bạn cần đăng nhập để viết đánh giá");
      return;
    }

    if (!newReview.trim()) return;

    setReviewSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          room_id: id,
          rating,
          content: newReview,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi đánh giá");
      }

      setNewReview("");
      setRating(5);
      alert("Đánh giá đã được gửi thành công.");
      await refreshReviews();
    } catch (error) {
      alert(error.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!authToken) {
      alert("Bạn cần đăng nhập để lưu phòng");
      return;
    }

    setSavingRoom(true);
    const url = isSaved ? "/api/users/remove-room" : "/api/users/save-room";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ room_id: id }),
      });

      if (!response.ok) {
        throw new Error("Không thể thực hiện thao tác");
      }

      setIsSaved(!isSaved);
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingRoom(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    if (!appointmentForm.full_name || !appointmentForm.phone || !appointmentForm.scheduled_at) {
      alert("Vui lòng điền đủ thông tin đặt lịch");
      return;
    }

    setAppointmentSubmitting(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = authToken;
      }

      const response = await fetch("/api/viewings", {
        method: "POST",
        headers,
        body: JSON.stringify({
          room_id: id,
          ...appointmentForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể đặt lịch xem phòng");
      }

      setAppointmentForm((prev) => ({
        ...prev,
        scheduled_at: "",
        note: "",
      }));
      alert("Đặt lịch xem phòng thành công. Chúng tôi sẽ liên hệ với bạn sớm.");
    } catch (error) {
      alert(error.message);
    } finally {
      setAppointmentSubmitting(false);
    }
  };

  if (loading) {
    return <div className="pd-container" style={{ padding: "50px", textAlign: "center" }}>Đang tải dữ liệu phòng...</div>;
  }

  if (!product) {
    return <NotFound />;
  }

  return (
    <div className="pd-container">
      <div className="pd-breadcrumb">
        <Link to="/welcome">&larr; Trở về Trang Chủ</Link>
      </div>

      <div className="pd-header">
        <h1>{product.name}</h1>
        <div className="pd-header-meta">
          <span className="pd-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="meta-icon" style={{ width: "15px", height: "15px", display: "inline-block", verticalAlign: "middle", marginRight: "5px", position: "relative", top: "-1px" }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {product.location}
          </span>
          <span className="pd-rating">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="meta-icon star-icon" style={{ width: "15px", height: "15px", display: "inline-block", verticalAlign: "middle", marginRight: "5px", position: "relative", top: "-1.5px", color: "var(--secondary-color)" }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "Mới"} ({reviews.length} đánh giá)
          </span>
        </div>
        <div className="pd-price">
          {formatPriceByUnit(product.price, product.price_unit)}
        </div>
      </div>

      <div className="pd-grid">
        <div className="pd-left">
          <div className="media-section">
            <div className="media-toggle">
              <button className={viewMode === "static" ? "active" : ""} onClick={() => setViewMode("static")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="toggle-btn-icon" style={{ width: "14px", height: "14px", marginRight: "6px", display: "inline-block", verticalAlign: "middle", position: "relative", top: "-1px" }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                Ảnh thực tế
              </button>
              <button className={viewMode === "3d" ? "active" : ""} onClick={() => setViewMode("3d")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="toggle-btn-icon" style={{ width: "14px", height: "14px", marginRight: "6px", display: "inline-block", verticalAlign: "middle", position: "relative", top: "-1px" }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                Trải nghiệm 3D
              </button>
            </div>

            <div className="media-viewer">
              {viewMode === "static" ? (
                <div className="static-gallery">
                  <img src={mainImage} className="main-image" alt="Room View" />
                  <div className="thumbnail-list">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        className={`thumbnail ${mainImage === img ? "active" : ""}`}
                        onClick={() => setMainImage(img)}
                        alt={`Thumb ${idx}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="model-container">
                  <Suspense fallback={<ThreeDLoader />}>
                    <StudentHouse3D />
                  </Suspense>
                  <p className="model-instruction">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "13px", height: "13px", display: "inline-block", verticalAlign: "middle", position: "relative", top: "-1px", color: "var(--primary-color)" }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Chuột trái xoay, chuột phải di chuyển, cuộn để phóng to/thu nhỏ.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="specs-section">
            <h2>Thông tin phòng</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spec-icon">
                  <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14z"></path>
                  <line x1="8" y1="7" x2="16" y2="7"></line>
                  <line x1="8" y1="11" x2="16" y2="11"></line>
                  <line x1="8" y1="15" x2="16" y2="15"></line>
                </svg>
                <div>
                  <strong>Diện tích</strong>
                  <p>{product.specs?.area ? `${product.specs.area}m²` : "Đang cập nhật"}</p>
                </div>
              </div>
              <div className="spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spec-icon">
                  <path d="M2 22V14a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 19h20M2 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M22 8V4a2 2 0 0 1-2-2h-4a2 2 0 0 1-2 2v4"></path>
                </svg>
                <div>
                  <strong>Bố trí</strong>
                  <p>{product.specs?.layout || "Đang cập nhật"}</p>
                </div>
              </div>
              <div className="spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spec-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div>
                  <strong>Tiện nghi</strong>
                  <p>{product.amenities?.length ? product.amenities.join(", ") : "Đang cập nhật"}</p>
                </div>
              </div>
              <div className="spec-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spec-icon">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <div>
                  <strong>Thú cưng</strong>
                  <p>{product.pet_policy || "Đang cập nhật"}</p>
                </div>
              </div>
            </div>

            <h3>Mô tả chi tiết</h3>
            <p className="description-text">
              {product.description || "Phòng trọ được thiết kế hiện đại, tối ưu không gian sống với nhiều ánh sáng tự nhiên."}
            </p>
          </div>

          <div className="reviews-section">
            <h2>Đánh giá từ người thuê</h2>

            {reviewsLoading ? (
              <p>Đang tải đánh giá...</p>
            ) : reviews.length > 0 ? (
              <div className="review-list">
                {reviews.map((comment) => (
                  <div className="review-item" key={comment._id}>
                    <img
                      src={comment.user_id?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_id?.full_name || "User")}&background=random`}
                      alt={comment.user_id?.full_name || "Người dùng"}
                      className="review-avatar"
                    />
                    <div className="review-content">
                      <div className="review-header">
                        <h4>{comment.user_id?.full_name || "Người dùng"}</h4>
                        <span className="stars">{"★".repeat(comment.rating)}{"☆".repeat(5 - comment.rating)}</span>
                      </div>
                      <span className="review-date">{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</span>
                      <p className="review-text">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có đánh giá nào được duyệt cho phòng này.</p>
            )}

            {userRole === "customer" && (
              <div className="add-review">
                <h3>Thêm đánh giá của bạn</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="rating-select">
                    <span>Chấm điểm: </span>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                      <option value={5}>5 Sao - Tuyệt vời</option>
                      <option value={4}>4 Sao - Tốt</option>
                      <option value={3}>3 Sao - Tạm được</option>
                      <option value={2}>2 Sao - Kém</option>
                      <option value={1}>1 Sao - Rất tệ</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    rows={4}
                    required
                  />
                  <button type="submit" className="submit-review-btn" disabled={reviewSubmitting}>
                    {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="pd-right">
          <div className="action-box">
            <h3>
              Trạng thái:{" "}
              <span className={roomStatusClass[product.status] || "status-available"}>
                {roomStatusLabel[product.status] || "Đang cập nhật"}
              </span>
            </h3>
            <button 
              className="book-btn" 
              onClick={() => {
                setShowBookingForm(!showBookingForm);
                setTimeout(() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              disabled={product.status === "rented"}
              style={{ opacity: product.status === "rented" ? 0.5 : 1, cursor: product.status === "rented" ? "not-allowed" : "pointer" }}
            >
              Đặt lịch xem phòng
            </button>
            <button 
              className="book-btn" 
              style={{ background: product.status === "rented" ? "#6c757d" : "#28a745", marginTop: "10px", cursor: product.status === "rented" ? "not-allowed" : "pointer" }} 
              onClick={handleOpenPayment}
              disabled={product.status === "rented"}
            >
              {product.status === "rented" ? "Phòng đã cho thuê" : "Đặt cọc giữ phòng"}
            </button>
            <div className="booking-form" style={{ marginTop: "16px" }}>
              <h4>Chu ky thue</h4>
              <input
                type="number"
                min="1"
                value={rentalDurationValue}
                onChange={(e) => setRentalDurationValue(Math.max(1, Number(e.target.value) || 1))}
              />
              <p style={{ marginTop: "10px" }}>Chu ky da chon: <strong>{formatRentalDuration(rentalDurationValue, product.price_unit)}</strong></p>
              <p>Tong tien tam tinh: <strong>{typeof product.price === "number" ? `${(product.price * rentalDurationValue).toLocaleString("vi-VN")}d` : "Dang cap nhat"}</strong></p>
            </div>
            <button 
               className={`save-btn ${isSaved ? "saved" : ""}`} 
               onClick={handleToggleSave}
               disabled={savingRoom}
            >
              {isSaved ? "❤️ Đã lưu (Hủy)" : "🤍 Lưu phòng"}
            </button>
            <button className="call-btn">📞 Gọi chủ nhà: 0352824919</button>

            {product.status !== "rented" ? (
              showBookingForm && (
                <form id="booking-form" className="booking-form" onSubmit={handleAppointmentSubmit}>
                  <h4>Đăng ký lịch xem</h4>
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    value={appointmentForm.full_name}
                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={appointmentForm.phone}
                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <input
                    type="datetime-local"
                    value={appointmentForm.scheduled_at}
                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                  />
                  <textarea
                    rows={3}
                    placeholder="Ghi chú thêm"
                    value={appointmentForm.note}
                    onChange={(e) => setAppointmentForm((prev) => ({ ...prev, note: e.target.value }))}
                  />
                  <button type="submit" className="submit-review-btn" disabled={appointmentSubmitting}>
                    {appointmentSubmitting ? "Đang gửi..." : "Xác nhận lịch xem"}
                  </button>
                </form>
              )
            ) : (
              <div className="booking-form" style={{ textAlign: "center", color: "#dc2626", fontWeight: "bold", marginTop: "20px" }}>
                Phòng này đã có người thuê. Các chức năng đặt lịch và cọc phòng đã bị khóa.
              </div>
            )}
          </div>
        </div>
      </div>

      <Chatbot />
      {showPayment && currentPayment && (
        <PaymentModal
          payment={currentPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={() => setProduct((prev) => (prev ? { ...prev, status: "reserved" } : prev))}
        />
      )}
    </div>
  );
}

export default ProductDetail;


