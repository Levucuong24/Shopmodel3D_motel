import React, { useState } from 'react';

function CallToAction() {
  const [phone, setPhone] = useState('');

  const handleCallMeBack = () => {
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    if (phoneRegex.test(phone)) {
      alert("Cảm ơn bạn! Chúng tôi đã nhận được yêu cầu. Đang kết nối tới hotline Zalo hỗ trợ...");
      window.open("https://zalo.me/0352824919", "_blank");
    } else {
      alert("Vui lòng nhập số điện thoại hợp lệ (10 chữ số).");
    }
  };

  return (
    <div className="cta-container">
      <div className="cta-content">
        <h2 className="cta-title">Bạn Có Câu Hỏi?</h2>
        <p className="cta-desc">Để lại số điện thoại của bạn, chúng tôi sẽ liên hệ tư vấn trực tiếp ngay lập tức.</p>
        
        <div className="cta-action">
          <input 
            type="text" 
            placeholder="Số điện thoại của bạn" 
            className="cta-input" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="cta-btn" onClick={handleCallMeBack}>Liên hệ ngay</button>
        </div>
      </div>
      
      <div className="cta-contact">
        <div className="cta-status">
          <span className="cta-status-badge">Đang hoạt động</span> hỗ trợ 24/7
        </div>
        <div className="cta-phone">0352 824 919</div>
      </div>
    </div>
  );
}

export default CallToAction;
