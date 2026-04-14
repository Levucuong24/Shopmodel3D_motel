import React from 'react';

function InvestmentStages() {
  const stages = [
    {
      step: "01",
      title: "Search & Select",
      desc: "Browse our wide range of rooms and choose the perfect one that suits your needs and budget."
    },
    {
      step: "02",
      title: "Booking & Confirmation",
      desc: "Fill in your details and confirm your reservation. We will send you a confirmation email."
    },
    {
      step: "03",
      title: "Payment",
      desc: "Securely pay for your booking online or choose to pay upon arrival at the property."
    },
    {
      step: "04",
      title: "Check-in & Enjoy",
      desc: "Arrive at your destination, check in smoothly, and enjoy a comfortable stay with us."
    }
  ];

  return (
    <div className="investment-stages">
      <div className="inv-header">
        <h3 className="inv-subtitle">BOOKING STAGES</h3>
        <h2 className="inv-title">All booking stages</h2>
        <p className="inv-desc">Follow these simple steps to easily book your perfect room and enjoy a wonderful stay.</p>
      </div>

      <div className="inv-grid">
        {stages.map((stage, index) => (
          <div className="inv-card" key={index}>
            <div className="inv-step">{stage.step}</div>
            <h4 className="inv-card-title">{stage.title}</h4>
            <p className="inv-card-desc">{stage.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InvestmentStages;
