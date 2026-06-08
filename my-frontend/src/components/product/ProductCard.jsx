import { Link } from "react-router-dom";
import { getUserRole } from "../../utils/authStorage.js";
import { formatPriceByUnit } from "../../utils/rentalFormat.js";

const statusMap = {
  available: "Con phong",
  reserved: "Da giu cho",
  rented: "Da cho thue",
};

function ProductCard({ product }) {
  const userRole = getUserRole();
  const roomId = product._id || product.id;
  const statusLabel = statusMap[product.status] || product.status || "Dang cap nhat";
  const topAmenities = Array.isArray(product.amenities) ? product.amenities.slice(0, 3) : [];

  return (
    <div className="card">
      <Link to={`/product/${roomId}`} className="card-link" style={{ textDecoration: "none", color: "inherit", position: "relative" }}>
        <div className="img-container">
          <img src={product.images?.[0] || product.image} alt={product.name || product.title} />
          <span className={`room-status-badge status-${product.status || "unknown"}`}>{statusLabel}</span>

          {!userRole && (
            <div className="card-hover-overlay">
              <p>{product.description || product.desc || "Dang cap nhat mo ta..."}</p>
            </div>
          )}
        </div>

        <div className="card-body">
          <h3>{product.name || product.title}</h3>
          <p className="location">{product.location}</p>
          <p className="price">{formatPriceByUnit(product.price, product.price_unit)}</p>

          <div className="room-meta">
            <span>{product.specs?.area ? `${product.specs.area}m2` : "Chua co dien tich"}</span>
            <span>{product.specs?.layout || "Chua co bo tri"}</span>
          </div>

          {topAmenities.length > 0 && (
            <div className="amenities-list">
              {topAmenities.map((item) => (
                <span className="amenity-chip" key={item}>{item}</span>
              ))}
            </div>
          )}

          <p className="pet-policy">{product.pet_policy || "Chua co thong tin thu cung"}</p>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
