// src/sockets/payment.socket.js
import { getIO } from "./index.js";

export const emitPaymentUpdate = (payment) => {
  const io = getIO();

  io.to(payment._id.toString()).emit("payment_updated", {
    payment_id: payment._id,
    status: payment.status,
    paid_at: payment.paid_at,
  });
};