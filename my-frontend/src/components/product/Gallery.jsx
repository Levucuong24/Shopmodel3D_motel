import { useState, useEffect } from "react";

function Gallery() {
    const [images, setImages] = useState([]);
    
    useEffect(() => {
        fetch("/api/gallery")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setImages(data.map(item => item.imageUrl));
                } else {
                    // Fallback dummy images if none exist
                    setImages([
                        "https://images.unsplash.com/photo-1501183638710-841dd1904471",
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                        "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
                        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                        "https://images.unsplash.com/photo-1484154218962-a197022b5858",
                        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09"
                    ]);
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải gallery:", err);
                // Fallback dummy images on error
                setImages([
                    "https://images.unsplash.com/photo-1501183638710-841dd1904471",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858",
                    "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09"
                ]);
            });
    }, []);

    return (
        <section className="gallery">

            <p className="gallery-subtitle">OUR GALLERY</p>

            <h2 className="gallery-title">3D Renderings</h2>

            <p className="gallery-desc">
                Hình ảnh thực tế về không gian và phối cảnh các dự án
            </p>

            <div className="gallery-grid">
                {images.map((img, index) => (
                    <div className="gallery-card" key={index}>
                        <img src={img} alt={`Gallery item ${index + 1}`} />
                    </div>
                ))}
            </div>

        </section>
    );
}

export default Gallery;