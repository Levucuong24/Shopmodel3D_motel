import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Music2, Share2, X, Tv, Rss } from "lucide-react";
import "../css/NotFound.css";

function NotFound() {
  return (
    <main className="relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-white/20 selection:text-white">

      {/* ── Fixed video background ── */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-[0]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* ── Content wrapper ── */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col min-h-[115vh]">

        {/* ── 404 Hero CTA ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center text-white gap-5 py-20">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-[clamp(100px,20vw,200px)] font-black leading-none tracking-tighter text-white/90"
               style={{ textShadow: "0 4px 40px rgba(255,255,255,0.2)" }}>
              404
            </p>
            <p className="text-[clamp(13px,2.5vw,20px)] tracking-wide text-white/60 lowercase">
              this is not the page you are looking for
            </p>
            <Link
              to="/welcome"
              className="mt-2 px-9 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] text-white border border-white/35 bg-white/8 backdrop-blur-md hover:bg-white/18 hover:border-white/60 hover:-translate-y-0.5 transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              Go Home
            </Link>
          </motion.div>
        </div>

        {/* ── Liquid Glass Footer ── */}
        <motion.footer
          className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 mt-32 md:mt-64"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          {/* Top grid — 12 cols */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">

            {/* Brand — col-span-5 */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
                </svg>
                <span className="text-xl font-medium tracking-widest">LUMINA</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm text-white/55">
                Lumina provides premium clarity on global events and cosmic wonders - shared with all for free.
              </p>
            </div>

            {/* Links — col-span-7 */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6">
              {/* Discover */}
              <div>
                <p className="text-sm uppercase tracking-wider text-white font-medium mb-4">Discover</p>
                <ul className="space-y-2">
                  {["Labs & Workshops", "Deep Dive Series", "Global Circle", "Resource Vault", "Future Roadmap"].map(item => (
                    <li key={item}>
                      <a href="#" className="text-xs text-white/55 hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              {/* The Mission */}
              <div>
                <p className="text-sm uppercase tracking-wider text-white font-medium mb-4">The Mission</p>
                <ul className="space-y-2">
                  {["Origin Story", "The Collective", "Newsroom Hub", "Join the Team"].map(item => (
                    <li key={item}>
                      <a href="#" className="text-xs text-white/55 hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Concierge */}
              <div>
                <p className="text-sm uppercase tracking-wider text-white font-medium mb-4">Concierge</p>
                <ul className="space-y-2">
                  {["Get in Touch", "Legal Privacy", "User Agreement", "Report Concern"].map(item => (
                    <li key={item}>
                      <a href="#" className="text-xs text-white/55 hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50">Curated by @GotInGeorgiG</p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Join the Journey:</span>
              <div className="flex items-center gap-3">
                {[Music2, Share2, X, Tv, Rss].map((Icon, i) => (
                  <a key={i} href="#" className="opacity-70 hover:opacity-100 transition-colors hover:text-white text-white">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.footer>

        <div className="pb-8" />
      </div>
    </main>
  );
}

export default NotFound;
