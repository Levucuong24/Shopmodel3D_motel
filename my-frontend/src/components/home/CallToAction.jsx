import React, { useState } from 'react';

function CallToAction() {
  const [phone, setPhone] = useState('');

  const handleCallMeBack = () => {
    const phoneRegex = /^(032|033|034|035|036|037|038|039|086|096|097|098)\d{7}$/;
    if (phoneRegex.test(phone)) {
      window.open("https://www.facebook.com/le.vu.cuong.513937", "_blank");
    } else {
      alert("Vui lòng nhập số điện thoại hợp lệ (đúng các đầu số yêu cầu).");
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
        <div className="cta-phone">035 282 4919</div>
      </div>
    </div>
  );
}

export default CallToAction;
