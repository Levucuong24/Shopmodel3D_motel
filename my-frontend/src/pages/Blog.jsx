import React from "react";
import "../css/Blog.css"; // We will create a simple CSS file or use inline styles, but let's use standard page styling
import Footer from "../components/layout/Footer";
import Chatbot from "../components/chatbot/Chatbot";

function Blog() {
  return (
    <div className="blog-page-container">
      <div className="blog-hero">
        <div className="blog-hero-content">
          <h1>HƯỚNG DẪN SỬ DỤNG HỆ THỐNG</h1>
          <p>Khám phá không gian sống tiện nghi qua nền tảng 3D tương tác chân thực.</p>
        </div>
      </div>

      <div className="blog-content-wrapper">
        <section className="blog-section">
          <h2>1. Tìm Kiếm & Xem Chi Tiết Phòng</h2>
          <p>
            Ngay tại trang chủ, bạn có thể dễ dàng tìm kiếm phòng trọ/chung cư mơ ước bằng cách:
          </p>
          <ul>
            <li>Sử dụng thanh tìm kiếm trên điều hướng (Navbar) để nhập vị trí, tên đường hoặc khu vực bạn muốn.</li>
            <li>Lọc phòng theo khuôn viên/Khu vực (Location) trực tiếp trên menu.</li>
            <li>Click vào từng thẻ phòng (Card) để xem chi tiết không gian, giá cả, và các tiện ích đi kèm.</li>
          </ul>
        </section>

        <section className="blog-section">
          <h2>2. Trải Nghiệm Mô Hình 3D Chân Thực</h2>
          <p>
            Đây là tính năng nổi bật nhất của nền tảng, cho phép bạn "tham quan" phòng mà không cần đến tận nơi:
          </p>
          <ul>
            <li>Trong trang chi tiết phòng, cuộn xuống phần <strong>Mô hình 3D</strong>.</li>
            <li>Sử dụng chuột và màn hình cảm ứng để xoay, lật, phóng to/thu nhỏ mô hình phòng.</li>
            <li>Tính năng này giúp bạn có cái nhìn tổng quan tỷ lệ thực tế, ánh sáng và bố cục phòng.</li>
          </ul>
        </section>

        <section className="blog-section">
          <h2>3. Hỏi Đáp Thông Minh Với Trợ Lý AI</h2>
          <p>
            Nếu bạn có bất kỳ thắc mắc nào về phòng hoặc các dịch vụ của hệ thống:
          </p>
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
          <p>
            Nền tảng hỗ trợ thanh toán bảo mật 100%:
          </p>
          <ul>
            <li>Sau khi chủ phòng duyệt lịch và chốt thỏa thuận, bạn có thể thanh toán cọc trực tiếp trên web.</li>
            <li>Chúng tôi hỗ trợ thanh toán qua cổng VNPay/MoMo an toàn và nhanh chóng.</li>
          </ul>
        </section>
      </div>
      
      <Footer />
      <Chatbot />
    </div>
  );
}

export default Blog;
