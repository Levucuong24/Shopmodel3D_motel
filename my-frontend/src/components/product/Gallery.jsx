function Gallery() {

    const images = [
        "https://images.unsplash.com/photo-1501183638710-841dd1904471",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858",
        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09"
    ];

    return (
        <section className="gallery">

            <p className="gallery-subtitle">OUR GALLERY</p>

            <h2 className="gallery-title">3D Renderings</h2>

            <p className="gallery-desc">
                There are many variations of passages of lorem ipsum
            </p>

            <div className="gallery-grid">

                {images.map((img, index) => (

                    <div className="gallery-card" key={index}>
                        <img src={img} />
                    </div>

                ))}

            </div>

        </section>
    );
}

export default Gallery;