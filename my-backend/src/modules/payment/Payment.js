// src/models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    customer_name: String,

    customer_email: String,

    amount: Number,

    pricing_unit: {
      type: String,
      enum: ["month", "week", "day", "hour", "minute"],
      default: "month",
    },

    rental_duration_unit: {
      type: String,
      enum: ["month", "week", "day", "hour", "minute"],
      default: "month",
    },

    rental_duration_value: {
      type: Number,
      default: 1,
      min: 1,
    },

    admin_commission: {
      type: Number,
      default: 0,
    },

    landlord_payout: {
      type: Number,
      default: 0,
    },

    payment_type: {
      type: String,
      enum: ["deposit", "monthly_rent"],
    },

    payment_method: {
      type: String,
      enum: ["BANK_QR", "MOMO", "VNPAY", "CASH"],
    },

    bank_info: {
      bank_code: String,
      bank_name: String,
      account_number: String,
      account_name: String,
    },

    qr_content: String,

    qr_url: String,
    
    orderCode: Number,
    
    checkoutUrl: String,

    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
    },

    transaction_ref: String,

    note: String,

    created_at: Date,

    expired_at: Date,

    paid_at: Date,

    rental_confirmed_at: Date,

    rental_start_at: Date,

    rental_end_at: Date,

    rental_released_at: Date,

    rental_release_reason: {
      type: String,
      enum: ["expired", "cancelled", null],
      default: null,
    },

    cancellation_status: {
      type: String,
      enum: ["none", "pending", "approved"],
      default: "none",
    },

    cancellation_requested_at: Date,

    cancellation_confirmed_at: Date,

    cancellation_note: String,
  }
);

export default mongoose.model("Payment", paymentSchema);
