import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative' }}>
        
        <div className="img-container">
          <img src={product.image} alt={product.name || product.title} />
          
          {/* Hover Overlay shown only for guests */}
          {!userRole && (
            <div className="card-hover-overlay">
              <p>{product.desc || "Đang cập nhật mô tả..."}</p>
            </div>
          )}
        </div>

        <div className="card-body">
          <h3>{product.name || product.title}</h3>
          <p className="location">{product.location}</p>
          <p className="price">{product.price}</p>
        </div>
        
      </Link>
    </div>
  );
}

export default ProductCard;