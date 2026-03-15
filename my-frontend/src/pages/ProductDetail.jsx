import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import products from "../data/products";
import StudentHouse3D from "../components/StudentHouse3D";
import Chatbot from "../components/Chatbot";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));

  // Toggle state: '3d' or 'static'
  const [viewMode, setViewMode] = useState("static");

  // State for adding a review (UI only)
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  if (!product) {
    return (
      <div className="not-found">
        Không tìm thấy phòng trọ.
      </div>
    );
  }

  // Mock data for static images (if product doesn't have an array, we use placeholders)
  const images = product.images || [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1964&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop"
  ];
  const [mainImage, setMainImage] = useState(images[0]);

  // Mock comments
  const mockComments = [
    {
      id: 1,
      name: "Trần Văn Bình",
      avatar: "https://ui-avatars.com/api/?name=Tran+Van+Binh&background=random",
      rating: 5,
      date: "08/03/2026",
      text: "Phòng rất thoáng và sạch sẽ. An ninh khu vực rất tốt, mình đi làm về khuya cũng yên tâm."
    },
    {
      id: 2,
      name: "Nguyễn Thị Hoa",
      avatar: "https://ui-avatars.com/api/?name=Nguyen+Thi+Hoa&background=random",
      rating: 4,
      date: "05/03/2026",
      text: "Thiết kế đẹp, tiện ích đầy đủ nhưng bãi để xe hơi chật vào buổi tối."
    }
  ];

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if(!newReview.trim()) return;
    alert(`Cảm ơn bạn đã đánh giá ${rating} sao! Đánh giá của bạn đang được duyệt.`);
    setNewReview("");
    setRating(5);
  };

  return (
    <div className="pd-container">
      {/* Navigation Breadcrumb */}
      <div className="pd-breadcrumb">
        <Link to="/welcome">&larr; Trở về Trang Chủ</Link>
      </div>

      <div className="pd-header">
        <h1>{product.name}</h1>
        <div className="pd-header-meta">
          <span className="pd-location">📍 {product.location}</span>
          <span className="pd-rating">⭐ 4.8 (24 đánh giá)</span>
        </div>
        <div className="pd-price">{product.price}</div>
      </div>

      <div className="pd-grid">
        {/* Left Column: Media & Specs */}
        <div className="pd-left">
          
          {/* Media Header with Toggle */}
          <div className="media-section">
            <div className="media-toggle">
              <button 
                className={viewMode === 'static' ? 'active' : ''} 
                onClick={() => setViewMode('static')}
              >
                📷 Ảnh thực tế
              </button>
              <button 
                className={viewMode === '3d' ? 'active' : ''} 
                onClick={() => setViewMode('3d')}
              >
                🧊 Trải nghiệm 3D
              </button>
            </div>

            {/* Media Content */}
            <div className="media-viewer">
              {viewMode === 'static' ? (
                <div className="static-gallery">
                  <img src={mainImage} className="main-image" alt="Room View" />
                  <div className="thumbnail-list">
                    {images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                        onClick={() => setMainImage(img)}
                        alt={`Thumb ${idx}`} 
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="model-container">
                  <StudentHouse3D />
                  <p className="model-instruction">* Chuột trái xoay, Chuột phải di chuyển, Lăn chuột để zoom.</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="specs-section">
            <h2>Thông tin phòng</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="icon">📏</span>
                <div>
                  <strong>Diện tích</strong>
                  <p>30m² - 45m²</p>
                </div>
              </div>
              <div className="spec-item">
                <span className="icon">🛏️</span>
                <div>
                  <strong>Bố trí</strong>
                  <p>1 Ngủ, 1 Khách</p>
                </div>
              </div>
              <div className="spec-item">
                <span className="icon">❄️</span>
                <div>
                  <strong>Tiện nghi</strong>
                  <p>Điều hòa, Nóng lạnh, Tủ lạnh</p>
                </div>
              </div>
              <div className="spec-item">
                <span className="icon">🐶</span>
                <div>
                  <strong>Thú cưng</strong>
                  <p>Được phép (dưới 5kg)</p>
                </div>
              </div>
            </div>

            <h3>Mô tả chi tiết</h3>
            <p className="description-text">
              Phòng trọ được thiết kế hiện đại, tối ưu không gian sống với nhiều ánh sáng tự nhiên. 
              Môi trường yên tĩnh, an ninh cực tốt, hệ thống khóa từ ra vào 24/7. Thích hợp cho người đi làm 
              và gia đình nhỏ cần không gian sống riêng tư, văn minh.
            </p>
          </div>
          
        </div>

        {/* Right Column: Contact & Reviews */}
        <div className="pd-right">
          {/* Action Box */}
          <div className="action-box">
            <h3>Trạng thái: <span className="status-available">Còn phòng</span></h3>
            <button className="book-btn">Đặt lịch xem phòng</button>
            <button className="call-btn">📞 Gọi chủ nhà: 0912 345 678</button>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h2>Đánh giá từ người thuê</h2>
            
            {/* List Reviews */}
            <div className="review-list">
              {mockComments.map(comment => (
                <div className="review-item" key={comment.id}>
                  <img src={comment.avatar} alt={comment.name} className="review-avatar" />
                  <div className="review-content">
                    <div className="review-header">
                      <h4>{comment.name}</h4>
                      <span className="stars">{'★'.repeat(comment.rating)}{'☆'.repeat(5-comment.rating)}</span>
                    </div>
                    <span className="review-date">{comment.date}</span>
                    <p className="review-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Review Form */}
            {localStorage.getItem('userRole') === 'customer' && (
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
                  ></textarea>
                  <button type="submit" className="submit-review-btn">Gửi đánh giá</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}

export default ProductDetail;
