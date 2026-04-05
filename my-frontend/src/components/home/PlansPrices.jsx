function PlansPrices() {

    const plans = [
        {
            title: "Studio",
            size: "45 m²",
            bed: "1 Bedroom",
            price: "$120,000",
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
        },
        {
            title: "Family Apartment",
            size: "80 m²",
            bed: "2 Bedrooms",
            price: "$220,000",
            image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb"
        },
        {
            title: "Luxury Apartment",
            size: "120 m²",
            bed: "3 Bedrooms",
            price: "$350,000",
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
        }
    ];

    return (
        <section className="plans">

            <p className="plans-subtitle">PLANS AND PRICES</p>

            <h2 className="plans-title">Choose Your Apartment</h2>

            <p className="plans-desc">
                We follow the latest developments in the building materials and
                technologies market, use only safe materials from trusted manufacturers
                and carefully select each specialist.
            </p>

            <div className="plans-grid">

                {plans.map((plan, index) => (

                    <div className="plan-card" key={index}>

                        <img src={plan.image} />

                        <div className="plan-info">

                            <h3>{plan.title}</h3>

                            <p>{plan.size}</p>

                            <p>{plan.bed}</p>

                            <p className="plan-price">{plan.price}</p>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default PlansPrices;