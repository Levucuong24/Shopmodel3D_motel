import Payment from "./Payment.js";

export const createPaymentService = async (data) => {
  return await Payment.create(data);
};

export const updatePaymentSuccess = async (qr_content) => {
  const payment = await Payment.findOne({ qr_content });

  if (!payment) throw new Error("Payment not found");

  payment.status = "success";
  payment.paid_at = new Date();

  await payment.save();
  return payment;
};

export const updatePaymentSuccessByOrderCode = async (orderCode) => {
  const payment = await Payment.findOne({ orderCode });

  if (!payment) throw new Error("Payment not found");

  payment.status = "success";
  payment.paid_at = new Date();

  await payment.save();
  return payment;
};

export const getPaymentByIdService = async (id) => {
  return await Payment.findById(id);
};
