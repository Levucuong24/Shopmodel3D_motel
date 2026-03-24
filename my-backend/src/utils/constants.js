// src/utils/constants.js

// =======================
// USER ROLES
// =======================
export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

// =======================
// ROOM STATUS
// =======================
export const ROOM_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  OCCUPIED: "occupied",
};

// =======================
// CONTRACT STATUS
// =======================
export const CONTRACT_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  ENDED: "ended",
};

// =======================
// PAYMENT STATUS
// =======================
export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// =======================
// PAYMENT TYPE
// =======================
export const PAYMENT_TYPE = {
  DEPOSIT: "deposit",
  MONTHLY: "monthly_rent",
};

// =======================
// PAYMENT METHOD
// =======================
export const PAYMENT_METHOD = {
  BANK_QR: "BANK_QR",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  CASH: "CASH",
};

// =======================
// REVIEW STATUS
// =======================
export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
};

// =======================
// CHATBOT
// =======================
export const CHAT_SENDER = {
  USER: "user",
  BOT: "bot",
};

// =======================
// AI GENERATION STATUS
// =======================
export const AI_STATUS = {
  GENERATING: "generating",
  COMPLETED: "completed",
  FAILED: "failed",
};

// =======================
// DEFAULT BANK CONFIG
// =======================
export const BANK_CONFIG = {
  DEFAULT_BANK: "MB",
  ACCOUNT_NUMBER: "123456789",
  ACCOUNT_NAME: "LE VU CUONG",
};

// =======================
// SYSTEM CONFIG
// =======================
export const SYSTEM_CONFIG = {
  QR_EXPIRE_MINUTES: 15,
};