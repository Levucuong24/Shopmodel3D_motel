import { Link } from "react-router-dom";
import { motion } from "motion/react";
import "../css/NotFound.css";

function NotFound() {
  return (
    <div className="nf-root">
      {/* Fullscreen video background */}
      <video
        className="nf-video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark overlay */}
      <div className="nf-overlay" />

      {/* Hero — centered on screen */}
      <section className="nf-hero">
        <motion.div
          className="nf-hero-inner"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="nf-code">404</p>
          <p className="nf-subtitle">this is not the page you are looking for</p>
          <p className="nf-desc">
            Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển sang một địa chỉ khác.
            Vui lòng quay lại trang chủ.
          </p>
          <Link to="/welcome" className="nf-btn">Quay lại Trang chủ</Link>
        </motion.div>
      </section>
    </div>
  );
}

export default NotFound;
