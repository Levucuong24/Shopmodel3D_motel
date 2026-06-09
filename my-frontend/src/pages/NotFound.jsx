import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Music2, Share2, X, Tv, Rss } from "lucide-react";
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

      {/* Footer — scrolls below the fold */}
      <div className="nf-footer-wrap">
        <motion.footer
          className="nf-footer liquid-glass"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          {/* Top grid */}
          <div className="nf-top-grid">
            {/* Brand */}
            <div className="nf-brand">
              <div className="nf-logo-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
                </svg>
                <span className="nf-logo-text">LUMINA</span>
              </div>
              <p className="nf-brand-desc">
                Lumina provides premium clarity on global events and cosmic wonders - shared with all for free.
              </p>
            </div>

            {/* Links */}
            <div className="nf-links-grid">
              <div>
                <p className="nf-links-header">Discover</p>
                <ul className="nf-links-list">
                  {["Labs & Workshops", "Deep Dive Series", "Global Circle", "Resource Vault", "Future Roadmap"].map(i => (
                    <li key={i}><a href="#">{i}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="nf-links-header">The Mission</p>
                <ul className="nf-links-list">
                  {["Origin Story", "The Collective", "Newsroom Hub", "Join the Team"].map(i => (
                    <li key={i}><a href="#">{i}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="nf-links-header">Concierge</p>
                <ul className="nf-links-list">
                  {["Get in Touch", "Legal Privacy", "User Agreement", "Report Concern"].map(i => (
                    <li key={i}><a href="#">{i}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="nf-bottom">
            <p className="nf-credit">Curated by @GotInGeorgiG</p>
            <div className="nf-socials">
              <span className="nf-socials-label">Join the Journey:</span>
              <div className="nf-socials-icons">
                {[Music2, Share2, X, Tv, Rss].map((Icon, i) => (
                  <a key={i} href="#" className="nf-icon-link"><Icon size={16} /></a>
                ))}
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default NotFound;
