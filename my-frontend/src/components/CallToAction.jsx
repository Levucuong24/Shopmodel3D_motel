import React from 'react';

function CallToAction() {
  return (
    <div className="cta-container">
      <div className="cta-content">
        <h2 className="cta-title">Have a Question?</h2>
        <p className="cta-desc">Call to us or leave your phone number, and we call you back</p>
        
        <div className="cta-action">
          <input type="text" placeholder="Your phone number" className="cta-input" />
          <button className="cta-btn">Call me back</button>
        </div>
      </div>
      
      <div className="cta-contact">
        <div className="cta-status">
          <span className="dot"></span> We online 24/7
        </div>
        <div className="cta-phone">(480) 555-0103</div>
      </div>
    </div>
  );
}

export default CallToAction;
