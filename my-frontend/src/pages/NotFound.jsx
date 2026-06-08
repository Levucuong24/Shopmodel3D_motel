import { Link } from "react-router-dom";
import "../css/NotFound.css";

function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <img src="/teddy_bear_404.png" alt="Lost Teddy Bear" className="notfound-img" />
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">this is not the page you are looking for</h2>
        <p className="notfound-desc">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển sang một địa chỉ khác. Vui lòng quay lại trang chủ.
        </p>
        <Link to="/welcome" className="notfound-btn">
          Quay lại Trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
