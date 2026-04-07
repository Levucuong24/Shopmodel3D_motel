import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import Gallery from "../components/product/Gallery";
import PlansPrices from "../components/home/PlansPrices";
import InvestmentStages from "../components/home/InvestmentStages";
import CallToAction from "../components/home/CallToAction";
import Footer from "../components/layout/Footer";
import Chatbot from "../components/chatbot/Chatbot";
import "../css/Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [topLandlords, setTopLandlords] = useState([]);
  const [loadingError, setLoadingError] = useState("");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
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

  return (
    <div>
      <div className="hero">
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">Dự án hoàn thiện</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Khách hàng hài lòng</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Cam kết pháp lý</span>
          </div>
        </div>

        <div className="style-title">KIỂU DÁNG TÌM KIẾM</div>
        <div className="category-box">
          <div className="cat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon">
              <path d="M3 21h18"></path><path d="M19 21v-4"></path><path d="M19 17a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"></path><path d="M14 15V9a2 2 0 0 0-2-2H8"></path><path d="M8 7v8"></path><path d="M10 3L6 7"></path><path d="M10 7L6 3"></path>
            </svg>
            <span>Biệt thự</span>
          </div>
          <div className="cat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon">
              <path d="M2 20h20"></path><path d="M5 20V9l7-6 7 6v11"></path><path d="M9 20v-6h6v6"></path><path d="M12 15h.01"></path>
            </svg>
            <span>Nhà vườn</span>
          </div>
          <div className="cat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>
            </svg>
            <span>Nhà phố</span>
          </div>
          <div className="cat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Chung cư</span>
          </div>
          <div className="cat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="cat-icon">
              <path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
            </svg>
            <span>Căn hộ</span>
          </div>
        </div>
      </div>

      <div className="home-content-wrapper">
        <div className="projects-section" style={{ flex: '7' }}>
          <h2 className="section-title">DỰ ÁN MỚI NHẤT</h2>

          {loadingError && (
            <p style={{ color: "#c62828", textAlign: "center", marginBottom: "16px" }}>
              {loadingError}
            </p>
          )}

          <div className="product-grid modern-grid">
            {products
              .filter((p) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                const loc = p.location ? p.location.toLowerCase() : "";
                const name = (p.name || p.title) ? (p.name || p.title).toLowerCase() : "";
                return loc.includes(q) || name.includes(q);
              })
              .map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
          </div>
        </div>

        <div className="top-landlords-section" style={{ flex: '3' }}>
          <h2 className="section-title">TOP CHỦ PHÒNG</h2>
          <div className="top-landlords-list">
            {topLandlords.length > 0 ? topLandlords.map((landlord, index) => (
               <div key={landlord._id} className="landlord-card">
                 <div className="landlord-rank">#{index + 1}</div>
                 <img src={landlord.landlord?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(landlord.landlord?.full_name || 'NV')}&background=4f46e5&color=fff`} className="landlord-avatar" alt="avatar" />
                 <div className="landlord-info">
                   <h4 className="landlord-name">{landlord.landlord?.full_name || 'Khuyết danh'}</h4>
                   <div className="landlord-stats">
                     <span className="landlord-rating">⭐ {landlord.avgRating.toFixed(1)}</span>
                     <span className="landlord-reviews">💬 {landlord.totalReviews} lượt đánh giá</span>
                     <span className="landlord-rooms">📦 {landlord.roomCount} bài đăng</span>
                   </div>
                 </div>
               </div>
            )) : (
              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '14px' }}>Chưa có danh sách thống kê xếp hạng chủ phòng.</p>
            )}
          </div>
        </div>
      </div>

      <Gallery />
      <PlansPrices />
      <InvestmentStages />
      <CallToAction />

      <Footer />
      <Chatbot />
    </div>
  );
}

export default Home;
