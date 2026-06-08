import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import Gallery from "../components/product/Gallery";
import InvestmentStages from "../components/home/InvestmentStages";
import CallToAction from "../components/home/CallToAction";
import Footer from "../components/layout/Footer";
import Chatbot from "../components/chatbot/Chatbot";
import "../css/Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [topLandlords, setTopLandlords] = useState([]);
  const [loadingError, setLoadingError] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [selectedLandlordId, setSelectedLandlordId] = useState("");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
        fetch("/api/users/count")
      .then((res) => res.json())
      .then((data) => setUserCount(data.count || 0))
      .catch((err) => console.error("Error fetching user count", err));

    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoadingError("");
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setLoadingError("Không thể tải danh sách room. Hãy kiểm tra backend đang chạy ở cổng 3000.");
      });

    fetch("/api/reviews/top-landlords")
      .then((res) => res.json())
      .then((data) => setTopLandlords(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching landlords", err));
  }, []);

  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedLandlordId, searchQuery]);

  const selectedLandlord = topLandlords.find((item) => item._id === selectedLandlordId);

  const filteredProducts = products.filter((product) => {
    const ownerId =
      typeof product.created_by === "object" && product.created_by !== null
        ? product.created_by._id?.toString()
        : product.created_by?.toString();

    const matchesLandlord = selectedLandlordId ? ownerId === selectedLandlordId : true;
    if (!matchesLandlord) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const loc = product.location ? product.location.toLowerCase() : "";
    const name = (product.name || product.title) ? (product.name || product.title).toLowerCase() : "";
    return loc.includes(q) || name.includes(q);
  });

  const productsToShow = filteredProducts.slice(0, visibleCount);

  const handleLandlordClick = (landlordId) => {
    setSelectedLandlordId((currentId) => (currentId === landlordId ? "" : landlordId));
  };

  return (
    <div>
      <div className="hero-and-category-container">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hero-video-bg"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="hero-section">
          <div className="hero-content">
            <span className="hero-eyebrow">Dịch Vụ Nhà Trọ 3D Cao Cấp</span>
            <h1 className="hero-title">Tìm Phòng Trọ Trực Quan Với Mô Hình 3D</h1>
            <p className="hero-subtitle">Khám phá không gian thực tế ảo 360 độ chân thực và tiện lợi nhất tại khu vực của bạn.</p>
            <div className="hero-actions">
              <a href="#projects" className="hero-primary-btn">Khám phá phòng</a>
              <a href="/map" className="hero-secondary-btn">Xem bản đồ</a>
            </div>

            <div className="hero-stats-row">
              <div className="stat-item-modern">
                <span className="stat-number-modern">{products.length}</span>
                <span className="stat-label-modern">Dự án hoàn thiện</span>
              </div>
              <div className="stat-divider-modern"></div>
              <div className="stat-item-modern">
                <span className="stat-number-modern">{userCount}</span>
                <span className="stat-label-modern">Khách hàng hài lòng</span>
              </div>
              <div className="stat-divider-modern"></div>
              <div className="stat-item-modern">
                <span className="stat-number-modern">100%</span>
                <span className="stat-label-modern">Đúng như ảnh</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img src="/banner.png" alt="Homie Banner" className="hero-visual-img" />
          </div>
        </div>

        <div className="category-section-modern">
          <div className="style-title-modern">KIỂU DÁNG TÌM KIẾM</div>
          <div className="category-box-modern">
            <div className="cat-item-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon-modern">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="9" y1="22" x2="9" y2="16"></line>
                <line x1="15" y1="22" x2="15" y2="16"></line>
                <line x1="9" y1="16" x2="15" y2="16"></line>
                <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M16 14h.01M12 14h.01"></path>
              </svg>
              <span>Chung cư mini</span>
            </div>
            <div className="stat-divider-modern"></div>
            <div className="cat-item-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon-modern">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Nhà trọ bình dân</span>
            </div>
            <div className="stat-divider-modern"></div>
            <div className="cat-item-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon-modern">
                <path d="M3 10v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10"></path>
                <path d="M9 22V12h6v10"></path>
                <path d="M2 10l10-8 10 8"></path>
              </svg>
              <span>Nhà nguyên căn</span>
            </div>
            <div className="stat-divider-modern"></div>
            <div className="cat-item-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon-modern">
                <path d="M3 21h18"></path>
                <path d="M5 21V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                <path d="M9 5h1M9 9h1M9 13h1M9 17h1M14 5h1M14 9h1M14 13h1M14 17h1"></path>
              </svg>
              <span>Chung cư</span>
            </div>
          </div>
        </div>
      </div>

      <div className="home-content-wrapper">
        <div className="projects-section" style={{ flex: "7" }}>
          <div className="section-header-with-action">
            <h2 className="section-title">
              {selectedLandlord
                ? `PHÒNG CỦA ${selectedLandlord.landlord?.full_name?.toUpperCase() || "CHỦ PHÒNG"}`
                : "DỰ ÁN MỚI NHẤT"}
            </h2>
            {selectedLandlord && (
              <button
                type="button"
                className="clear-landlord-filter"
                onClick={() => setSelectedLandlordId("")}
              >
                Xem tất cả phòng
              </button>
            )}
          </div>

          {loadingError && (
            <p style={{ color: "#c62828", textAlign: "center", marginBottom: "16px" }}>
              {loadingError}
            </p>
          )}

          <div className="product-grid modern-grid">
            {productsToShow.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {visibleCount < filteredProducts.length && (
            <div className="load-more-container">
              <button
                type="button"
                className="load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + 6)}
              >
                Xem thêm phòng trọ ({filteredProducts.length - visibleCount} phòng còn lại)
              </button>
            </div>
          )}

          {!loadingError && filteredProducts.length === 0 && (
            <p className="empty-products-message">
              {selectedLandlord
                ? `Hiện chưa có phòng công khai phù hợp của ${selectedLandlord.landlord?.full_name || "chủ phòng này"}.`
                : "Không tìm thấy phòng phù hợp."}
            </p>
          )}
        </div>

        <div className="top-landlords-section" style={{ flex: "3" }}>
          <h2 className="section-title">TOP CHỦ PHÒNG</h2>
          <div className="top-landlords-list">
            {topLandlords.length > 0 ? topLandlords.map((landlord, index) => (
              <button
                key={landlord._id}
                type="button"
                className={`landlord-card ${selectedLandlordId === landlord._id ? "active" : ""}`}
                onClick={() => handleLandlordClick(landlord._id)}
              >
                <div className="landlord-rank">#{index + 1}</div>
                <img
                  src={landlord.landlord?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(landlord.landlord?.full_name || "NV")}&background=4f46e5&color=fff`}
                  className="landlord-avatar"
                  alt="avatar"
                />
                <div className="landlord-info">
                  <h4 className="landlord-name">{landlord.landlord?.full_name || "Khuyết danh"}</h4>
                  <div className="landlord-stats">
                    <span className="landlord-rating">★ {landlord.avgRating.toFixed(1)}</span>
                    <span className="landlord-reviews">{landlord.totalReviews} lượt đánh giá</span>
                    <span className="landlord-rooms">{landlord.roomCount} bài đăng</span>
                  </div>
                </div>
              </button>
            )) : (
              <p style={{ color: "#64748b", fontStyle: "italic", fontSize: "14px" }}>
                Chưa có danh sách thống kê xếp hạng chủ phòng.
              </p>
            )}
          </div>
        </div>
      </div>

      <Gallery />
      <InvestmentStages />
      <CallToAction />

      <Footer />
      <Chatbot />
    </div>
  );
}

export default Home;
