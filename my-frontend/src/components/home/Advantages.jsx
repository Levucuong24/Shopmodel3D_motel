import React from 'react';

function Advantages() {

    const advantages = [
        {
            title: "Service Premises",
            desc: "Office space and convenience stores located on the ground floor.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="adv-svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            )
        },
        {
            title: "Safety and Security",
            desc: "Reliable round-the-clock surveillance using modern technologies.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="adv-svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            )
        },
        {
            title: "Environmental Solutions",
            desc: "LED lighting and charging stations for electric vehicles.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="adv-svg">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
              </svg>
            )
        },
        {
            title: "Ease of Management",
            desc: "Professional operators manage the property for you.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="adv-svg">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            )
        },
        {
            title: "Guaranteed Income",
            desc: "Monthly income guaranteed in the contract.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="adv-svg">
                <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            )
        },
        {
            title: "Great Location",
            desc: "Perfect location for stable apartment rentals.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="adv-svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
              </svg>
            )
        }
    ];

    return (
        <section className="advantages">

            <h2 className="adv-title">OUR ADVANTAGES</h2>

            <div className="adv-grid">

                {advantages.map((item, index) => (

                    <div className="adv-card" key={index}>

                        <div className="adv-icon">
                          {item.icon}
                        </div>

                        <h3>{item.title}</h3>

                        <p>{item.desc}</p>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default Advantages;