import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Music2, Facebook, Twitter, Youtube, Instagram } from "lucide-react";
import "../css/NotFound.css";

function NotFound() {
  return (
    <main className="notfound-root">
      {/* Fixed video background */}
      <video
        className="notfound-video-bg"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Content wrapper */}
      <div className="notfound-content z-10">
        {/* 404 Hero */}
        <div className="notfound-hero">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="notfound-hero-inner"
          >
            <p className="notfound-code-text">404</p>
            <p className="notfound-subtitle">this is not the page you are looking for</p>
            <Link to="/welcome" className="notfound-cta-btn">
              Go Home
            </Link>
          </motion.div>
        </div>

        {/* Liquid Glass Footer */}
        <motion.footer
          className="liquid-glass notfound-footer"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          {/* Top grid */}
          <div className="footer-top-grid">
            {/* Brand col */}
            <div className="footer-brand-col">
              <div className="footer-logo-row">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                >
                  <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
                </svg>
                <span className="footer-logo-text">LUMINA</span>
              </div>
              <p className="footer-desc">
                Lumina provides premium clarity on global events and cosmic wonders — shared with all for free.
              </p>
            </div>

            {/* Links cols */}
            <div className="footer-links-grid">
              <div>
                <p className="footer-links-header">Discover</p>
                <ul className="footer-links-list">
                  <li><a href="#">Labs &amp; Workshops</a></li>
                  <li><a href="#">Deep Dive Series</a></li>
                  <li><a href="#">Global Circle</a></li>
                  <li><a href="#">Resource Vault</a></li>
                  <li><a href="#">Future Roadmap</a></li>
                </ul>
              </div>
              <div>
                <p className="footer-links-header">The Mission</p>
                <ul className="footer-links-list">
                  <li><a href="#">Origin Story</a></li>
                  <li><a href="#">The Collective</a></li>
                  <li><a href="#">Newsroom Hub</a></li>
                  <li><a href="#">Join the Team</a></li>
                </ul>
              </div>
              <div>
                <p className="footer-links-header">Concierge</p>
                <ul className="footer-links-list">
                  <li><a href="#">Get in Touch</a></li>
                  <li><a href="#">Legal Privacy</a></li>
                  <li><a href="#">User Agreement</a></li>
                  <li><a href="#">Report Concern</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom-bar">
            <p className="footer-credit">Curated by @GotInGeorgiG</p>
            <div className="footer-socials">
              <span className="footer-socials-label">Join the Journey:</span>
              <div className="footer-socials-icons">
                <a href="#" className="footer-icon-link"><Music2 size={16} /></a>
                <a href="#" className="footer-icon-link"><Facebook size={16} /></a>
                <a href="#" className="footer-icon-link"><Twitter size={16} /></a>
                <a href="#" className="footer-icon-link"><Youtube size={16} /></a>
                <a href="#" className="footer-icon-link"><Instagram size={16} /></a>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}

export default NotFound;
