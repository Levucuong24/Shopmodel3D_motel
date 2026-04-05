import Contract from "../contract/Contract.js";
import Room from "../room/Room.js";
import { createPaymentService, getPaymentByIdService, updatePaymentSuccess } from "./payment.service.js";
import { emitPaymentUpdate } from "../../sockets/payment.socket.js";
import { sendAdminPaymentNotification } from "../../utils/mailer.js";

export const createPayment = async (req, res) => {
  const qr = "PAY_" + Date.now();
  const { room_id } = req.body;

  let paymentPayload = {
    ...req.body,
    qr_content: qr,
    status: "pending",
    created_at: new Date(),
    expired_at: new Date(Date.now() + 15 * 60 * 1000),
  };

  if (room_id) {
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    paymentPayload = {
      ...paymentPayload,
      room_id: room._id,
      amount: room.price,
      note: req.body.note || `Thanh toán cho phòng ${room.name}`,
    };
  }

  const payment = await createPaymentService(paymentPayload);
  res.json(payment);
};

export const paymentWebhook = async (req, res) => {
  const { qr_content } = req.body;

  const payment = await updatePaymentSuccess(qr_content);

  if (payment.contract_id) {
    const contract = await Contract.findById(payment.contract_id);
    if (contract) {
      contract.status = "active";
      await contract.save();

      if (contract.room_id) {
        const room = await Room.findById(contract.room_id);
        if (room) {
          room.status = "reserved";
          await room.save();
        }
      }
    }
  }

  if (!payment.contract_id && payment.room_id) {
    const room = await Room.findById(payment.room_id);
    if (room) {
      room.status = "reserved";
      await room.save();
    }
  }

  emitPaymentUpdate(payment);
  await sendAdminPaymentNotification({
    customerName: payment.customer_name || "Khách hàng",
    customerEmail: payment.customer_email || "Khong co email",
    amount: payment.amount,
  });

  res.json({ message: "Payment success" });
};

export const getPaymentById = async (req, res) => {
  const payment = await getPaymentByIdService(req.params.id);

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  res.json(payment);
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("room_id").populate("user_id").sort({ created_at: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmRental = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = "success";
    await payment.save();

    if (payment.room_id) {
      const room = await Room.findById(payment.room_id);
      if (room) {
        room.status = "rented";
        if (payment.user_id) {
          room.tenant_id = payment.user_id;
        }
        await room.save();
      }
    }

    res.json({ message: "Room rental confirmed successfully", payment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
