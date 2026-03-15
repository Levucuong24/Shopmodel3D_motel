import React from 'react';

function InvestmentStages() {
  const stages = [
    {
      step: "01",
      title: "Consultation",
      desc: "You leave a request and our manager will contact you. Or you can call us yourself"
    },
    {
      step: "02",
      title: "Booking Apartments",
      desc: "You pay a deposit for the reservation of the apartment you selected"
    },
    {
      step: "03",
      title: "First Installment",
      desc: "During the construction phase, you pay 20% of the cost of the apartment"
    },
    {
      step: "04",
      title: "Commissioning",
      desc: "During construction, you pay 30% in 3 installments. After commissioning, profit"
    }
  ];

  return (
    <div className="investment-stages">
      <div className="inv-header">
        <h3 className="inv-subtitle">INVESTMENT STAGES</h3>
        <h2 className="inv-title">All Stages of Investment</h2>
        <p className="inv-desc">There are many variations of passages of lorem ipsum</p>
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
