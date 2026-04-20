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
        <h2 className="cta-title">Have a Question?</h2>
        <p className="cta-desc">Call to us or leave your phone number, and we call you back</p>
        
        <div className="cta-action">
          <input 
            type="text" 
            placeholder="Your phone number" 
            className="cta-input" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="cta-btn" onClick={handleCallMeBack}>Call me back</button>
        </div>
      </div>
      
      <div className="cta-contact">
        <div className="cta-status">
          <span className="dot"></span> We online 24/7
        </div>
        <div className="cta-phone">0352824919</div>
      </div>
    </div>
  );
}

export default CallToAction;
