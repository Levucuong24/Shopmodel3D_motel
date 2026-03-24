import { Link } from "react-router-dom";

const statusMap = {
  available: "Còn phòng",
  reserved: "Đã giữ chỗ",
  rented: "Đã cho thuê",
};

function ProductCard({ product }) {
  const userRole = localStorage.getItem("userRole");
  const roomId = product._id || product.id;
  const statusLabel = statusMap[product.status] || product.status || "Đang cập nhật";
  const topAmenities = Array.isArray(product.amenities) ? product.amenities.slice(0, 3) : [];

  return (
    <div className="card">
      <Link to={`/product/${roomId}`} style={{ textDecoration: "none", color: "inherit", display: "block", position: "relative" }}>
        <div className="img-container">
          <img src={product.images?.[0] || product.image} alt={product.name || product.title} />
          <span className={`room-status-badge status-${product.status || "unknown"}`}>{statusLabel}</span>

          {!userRole && (
            <div className="card-hover-overlay">
              <p>{product.description || product.desc || "Đang cập nhật mô tả..."}</p>
            </div>
          )}
        </div>

        <div className="card-body">
          <h3>{product.name || product.title}</h3>
          <p className="location">{product.location}</p>
          <p className="price">
            {typeof product.price === "number" ? `${product.price.toLocaleString("vi-VN")}đ / tháng` : product.price}
          </p>

          <div className="room-meta">
            <span>{product.specs?.area ? `${product.specs.area}m²` : "Chưa có diện tích"}</span>
            <span>{product.specs?.layout || "Chưa có bố trí"}</span>
          </div>

          {topAmenities.length > 0 && (
            <div className="amenities-list">
              {topAmenities.map((item) => (
                <span className="amenity-chip" key={item}>{item}</span>
              ))}
            </div>
          )}

          <p className="pet-policy">
            {product.pet_policy || "Chưa có thông tin thú cưng"}
          </p>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
