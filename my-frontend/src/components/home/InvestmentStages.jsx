import React from 'react';

function InvestmentStages() {
  const stages = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inv-step-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
      title: "Tìm kiếm & Lựa chọn",
      desc: "Duyệt qua danh sách phòng trọ đa dạng và chọn lựa phòng phù hợp nhất với nhu cầu và ngân sách của bạn."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inv-step-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      title: "Đặt phòng & Xác nhận",
      desc: "Điền thông tin cá nhân và gửi yêu cầu giữ chỗ. Đội ngũ hỗ trợ sẽ xác nhận thông tin nhanh chóng."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inv-step-icon">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      ),
      title: "Thanh toán An toàn",
      desc: "Thực hiện thanh toán đặt cọc an toàn trực tuyến hoặc lựa chọn phương thức thanh toán trực tiếp khi nhận phòng."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inv-step-icon">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      title: "Nhận phòng & Trải nghiệm",
      desc: "Di chuyển đến nơi, hoàn thành thủ tục nhận phòng dễ dàng và bắt đầu trải nghiệm không gian sống lý tưởng."
    }
  ];

  return (
    <div className="investment-stages">
      <div className="inv-header">
        <h3 className="inv-subtitle">QUY TRÌNH ĐƠN GIẢN</h3>
        <h2 className="inv-title">Cách thức hoạt động</h2>
        <p className="inv-desc">Theo dõi các bước rõ ràng để sở hữu phòng trọ mơ ước của bạn nhanh chóng.</p>
      </div>

      <div className="inv-grid">
        {stages.map((stage, index) => (
          <div className="inv-card" key={index}>
            <div className="inv-icon-wrapper">{stage.icon}</div>
            <h4 className="inv-card-title">{stage.title}</h4>
            <p className="inv-card-desc">{stage.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InvestmentStages;
