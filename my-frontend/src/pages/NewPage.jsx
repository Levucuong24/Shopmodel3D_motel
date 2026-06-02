import React from "react";
import "../css/NewPage.css";
import Footer from "../components/layout/Footer";
import Chatbot from "../components/chatbot/Chatbot";

function NewPage() {
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

  return (
    <div className="new-page-container">
      <div className="new-hero">
        <div className="new-hero-content animate-fade-in">
          <span className="hero-tag">Bản Tin & Cập Nhật</span>
          <h1>CÓ GÌ MỚI TRÊN EWE 3D?</h1>
          <p>Cập nhật những tính năng, bài viết và phòng trọ mới nhất vừa được tích hợp trên hệ thống.</p>
        </div>
      </div>

      <div className="new-content-wrapper">
        <div className="new-section-title">
          <h2>Tính Năng & Sự Kiện Nổi Bật</h2>
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

      <Footer />
      <Chatbot />
    </div>
  );
}

export default NewPage;
