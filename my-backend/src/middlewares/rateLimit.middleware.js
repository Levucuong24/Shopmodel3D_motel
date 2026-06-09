import { rateLimit } from "express-rate-limit";

// General rate limiter for all API endpoints: 
// Maximum 150 requests per 1 minute from a single IP address
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 150,
  message: {
    message: "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau 1 phút.",
  },
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for Authentication endpoints (login, signup):
// Maximum 20 requests per 15 minutes from a single IP address to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  message: {
    message: "Phát hiện quá nhiều lượt thử đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
