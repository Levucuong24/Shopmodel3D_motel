import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StudentHouse3D from "../components/StudentHouse3D";
import Chatbot from "../components/Chatbot";
import PaymentModal from "../components/PaymentModal";
import "./ProductDetail.css";

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
  const authToken = localStorage.getItem("authToken");
  const storedUser = JSON.parse(localStorage.getItem("userData") || "null");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("static");
  const [showPayment, setShowPayment] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [mainImage, setMainImage] = useState(fallbackImages[0]);

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

  useEffect(() => {
    setLoading(true);

    fetch(`/api/rooms/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
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

  const images = product?.images?.length ? product.images : fallbackImages;

  useEffect(() => {
    setMainImage(images[0]);
  }, [id, product]);

  const refreshReviews = async () => {
    const response = await fetch(`/api/reviews/${id}`);
    const data = await response.json();
    setReviews(Array.isArray(data) ? data : []);
  };

  const handleOpenPayment = async () => {
    if (!product) return;

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: id,
          amount: product.price,
          customer_name: storedUser?.full_name || "",
          customer_email: storedUser?.email || "",
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

  if (!product || product.message === "Room not found") {
    return <div className="not-found">Không tìm thấy phòng trọ.</div>;
  }

  return (
    <div className="pd-container">
      <div className="pd-breadcrumb">
        <Link to="/welcome">&larr; Trở về Trang Chủ</Link>
      </div>

      <div className="pd-header">
        <h1>{product.name}</h1>
        <div className="pd-header-meta">
          <span className="pd-location">📍 {product.location}</span>
          <span className="pd-rating">⭐ {reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "Mới"} ({reviews.length} đánh giá)</span>
        </div>
        <div className="pd-price">
          {typeof product.price === "number" ? `${product.price.toLocaleString("vi-VN")}đ / tháng` : product.price}
        </div>
      </div>

      <div className="pd-grid">
        <div className="pd-left">
          <div className="media-section">
            <div className="media-toggle">
              <button className={viewMode === "static" ? "active" : ""} onClick={() => setViewMode("static")}>
                📷 Ảnh thực tế
              </button>
              <button className={viewMode === "3d" ? "active" : ""} onClick={() => setViewMode("3d")}>
                🧊 Trải nghiệm 3D
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
                  <StudentHouse3D />
                  <p className="model-instruction">* Chuột trái xoay, chuột phải di chuyển, lăn chuột để zoom.</p>
                </div>
              )}
            </div>
          </div>

          <div className="specs-section">
            <h2>Thông tin phòng</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="icon">📏</span>
                <div>
                  <strong>Diện tích</strong>
                  <p>{product.specs?.area ? `${product.specs.area}m²` : "Đang cập nhật"}</p>
                </div>
              </div>
              <div className="spec-item">
                <span className="icon">🛏️</span>
                <div>
                  <strong>Bố trí</strong>
                  <p>{product.specs?.layout || "Đang cập nhật"}</p>
                </div>
              </div>
              <div className="spec-item">
                <span className="icon">❄️</span>
                <div>
                  <strong>Tiện nghi</strong>
                  <p>{product.amenities?.length ? product.amenities.join(", ") : "Đang cập nhật"}</p>
                </div>
              </div>
              <div className="spec-item">
                <span className="icon">🐶</span>
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
        </div>

        <div className="pd-right">
          <div className="action-box">
            <h3>
              Trạng thái:{" "}
              <span className={roomStatusClass[product.status] || "status-available"}>
                {roomStatusLabel[product.status] || "Đang cập nhật"}
              </span>
            </h3>
            <button className="book-btn" onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}>
              Đặt lịch xem phòng
            </button>
            <button className="book-btn" style={{ background: "#28a745", marginTop: "10px" }} onClick={handleOpenPayment}>
              Đặt cọc giữ phòng
            </button>
            <button className="call-btn">📞 Gọi chủ nhà: 0912 345 678</button>

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

            {localStorage.getItem("userRole") === "customer" && (
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
