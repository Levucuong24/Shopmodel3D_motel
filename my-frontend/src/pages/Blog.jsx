import React, { useState } from "react";
import "../css/Blog.css";
import Footer from "../components/layout/Footer";
import Chatbot from "../components/chatbot/Chatbot";

const UserGuideContent = () => (
  <div className="blog-content-wrapper">
    <section className="blog-section">
      <h2>1. Tìm Kiếm & Xem Chi Tiết Phòng</h2>
      <p>Ngay tại trang chủ, bạn có thể dễ dàng tìm kiếm phòng trọ/chung cư mơ ước bằng cách:</p>
      <ul>
        <li>Sử dụng thanh tìm kiếm trên điều hướng (Navbar) để nhập vị trí, tên đường hoặc khu vực bạn muốn.</li>
        <li>Lọc phòng theo khuôn viên/Khu vực (Location) trực tiếp trên menu.</li>
        <li>Click vào từng thẻ phòng (Card) để xem chi tiết không gian, giá cả, và các tiện ích đi kèm.</li>
      </ul>
    </section>

    <section className="blog-section">
      <h2>2. Trải Nghiệm Mô Hình 3D Chân Thực</h2>
      <p>Đây là tính năng nổi bật nhất của nền tảng, cho phép bạn "tham quan" phòng mà không cần đến tận nơi:</p>
      <ul>
        <li>Trong trang chi tiết phòng, cuộn xuống phần <strong>Mô hình 3D</strong>.</li>
        <li>Sử dụng chuột và màn hình cảm ứng để xoay, lật, phóng to/thu nhỏ mô hình phòng.</li>
        <li>Tính năng này giúp bạn có cái nhìn tổng quan tỷ lệ thực tế, ánh sáng và bố cục phòng.</li>
      </ul>
    </section>

    <section className="blog-section">
      <h2>3. Hỏi Đáp Thông Minh Với Trợ Lý AI</h2>
      <p>Nếu bạn có bất kỳ thắc mắc nào về phòng hoặc các dịch vụ của hệ thống:</p>
      <ul>
        <li>Nhấn vào biểu tượng Chat góc dưới bên phải màn hình.</li>
        <li>Trợ lý ảo AI của chúng tôi sẽ giải đáp thắc mắc của bạn về: <em>tìm phòng theo ngân sách, chính sách thuê, thông tin khu vực...</em></li>
        <li>AI được tích hợp sẵn dữ liệu về các phòng mới nhất nên luôn đưa ra gợi ý có độ chính xác cao.</li>
      </ul>
    </section>

    <section className="blog-section">
      <h2>4. Quản Lý Thông Tin Cá Nhân & Lịch Xem Phòng</h2>
      <p>Sau khi tạo tài khoản và đăng nhập với tư cách Khách Hàng (Customer), bạn sẽ có quyền truy cập <strong>Customer Dashboard</strong> (thông qua menu góc phải trên):</p>
      <ul>
        <li><strong>Phòng đã lưu:</strong> Đánh dấu các phòng yêu thích để xem lại sau.</li>
        <li><strong>Lịch xem phòng:</strong> Sau khi gửi yêu cầu xem phòng thực tế cho Chủ Phòng, hệ thống sẽ giúp bạn theo dõi trạng thái yêu cầu (Đang chờ, Đã duyệt, Hoàn thành).</li>
        <li><strong>Phòng đang thuê:</strong> Quản lý danh sách các phòng bạn đã chốt hợp đồng và thông tin thanh toán.</li>
      </ul>
    </section>

    <section className="blog-section">
      <h2>5. Đặt Cọc & Thanh Toán Trực Tuyến</h2>
      <p>Nền tảng hỗ trợ thanh toán bảo mật 100%:</p>
      <ul>
        <li>Sau khi chủ phòng duyệt lịch và chốt thỏa thuận, bạn có thể thanh toán cọc trực tiếp trên web.</li>
        <li>Chúng tôi hỗ trợ thanh toán qua cổng VNPay/MoMo an toàn và nhanh chóng.</li>
      </ul>
    </section>
  </div>
);

const MOCK_POSTS = [
  {
    id: 1,
    title: "Hướng Dẫn Sử Dụng Hệ Thống 3D Motel",
    excerpt: "Khám phá không gian sống tiện nghi qua nền tảng 3D tương tác chân thực. Hướng dẫn chi tiết cách tìm phòng, xem 3D, chat với AI...",
    date: "10/06/2026",
    content: <UserGuideContent />,
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Kinh Nghiệm Thuê Trọ Dành Cho Sinh Viên Mới Lên Thành Phố",
    excerpt: "Những lưu ý quan trọng khi đi tìm phòng trọ, cách đọc hợp đồng, và mẹo chọn khu vực an ninh tốt.",
    date: "12/06/2026",
    content: <div className="blog-content-wrapper"><section className="blog-section"><p>Bài viết đang cập nhật nội dung...</p></section></div>,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Top 5 Xu Hướng Thiết Kế Nội Thất Phòng Trọ 2026",
    excerpt: "Biến căn phòng nhỏ của bạn thành một không gian sống đầy cảm hứng với các xu hướng thiết kế tối giản và hiện đại.",
    date: "15/06/2026",
    content: <div className="blog-content-wrapper"><section className="blog-section"><p>Bài viết đang cập nhật nội dung...</p></section></div>,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

function Blog() {
  const [activeArticle, setActiveArticle] = useState(null);

  return (
    <div className="blog-page-container">
      <div className="blog-hero">
        <div className="blog-hero-content">
          <h1>{activeArticle ? activeArticle.title : "TIN TỨC & KIẾN THỨC"}</h1>
          <p>{activeArticle ? `Ngày đăng: ${activeArticle.date}` : "Cập nhật những thông tin mới nhất về thị trường thuê phòng và hướng dẫn sử dụng nền tảng."}</p>
        </div>
      </div>

      {!activeArticle ? (
        <div className="blog-list-wrapper">
          <div className="blog-grid">
            {MOCK_POSTS.map((post) => (
              <div key={post.id} className="blog-card" onClick={() => setActiveArticle(post)}>
                <div className="blog-card-image" style={{ backgroundImage: `url(${post.image})` }}></div>
                <div className="blog-card-content">
                  <span className="blog-card-date">{post.date}</span>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-read-more">Đọc tiếp &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="blog-article-detail">
          <button className="blog-back-btn" onClick={() => setActiveArticle(null)}>
            &larr; Quay lại danh sách bài viết
          </button>
          {activeArticle.content}
        </div>
      )}
      
      <Footer />
      <Chatbot />
    </div>
  );
}

export default Blog;
