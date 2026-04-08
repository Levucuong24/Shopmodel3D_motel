import Contract from "../contract/Contract.js";
import Payment from "./Payment.js";
import Revenue from "./Revenue.js";
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
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Chỉ chủ nhà mới được quản lý đặt cọc" });
    }

    const payments = await Payment.find()
      .populate({
        path: "room_id",
        populate: { path: "created_by", select: "full_name" },
      })
      .populate("user_id")
      .sort({ created_at: -1 });

    const ownedPayments = payments.filter((payment) => {
      const ownerId =
        payment.room_id?.created_by && typeof payment.room_id.created_by === "object"
          ? payment.room_id.created_by._id?.toString()
          : payment.room_id?.created_by?.toString();

      return ownerId === req.user.id;
    });

    res.json(ownedPayments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminRevenue = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được xem kế toán doanh thu" });
    }

    const commissionPayments = await Payment.find({
      admin_commission: { $gt: 0 },
      rental_confirmed_at: { $exists: true, $ne: null },
    })
      .populate("room_id")
      .populate("user_id")
      .sort({ rental_confirmed_at: -1 });

    const monthlyRevenue = await Revenue.find({ status: "admin_commission" }).sort({ month: -1 });

    const summary = commissionPayments.reduce(
      (acc, payment) => {
        acc.totalCommission += Number(payment.admin_commission || 0);
        acc.totalLandlordPayout += Number(payment.landlord_payout || 0);
        acc.totalTransactions += 1;
        return acc;
      },
      { totalCommission: 0, totalLandlordPayout: 0, totalTransactions: 0 }
    );

    res.json({
      payments: commissionPayments,
      monthlyRevenue,
      summary,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmRental = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Chỉ chủ nhà mới được xác nhận thuê phòng" });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const room = payment.room_id ? await Room.findById(payment.room_id) : null;
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.created_by?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xác nhận giao dịch này" });
    }

    if (payment.rental_confirmed_at || room.status === "rented") {
      return res.status(400).json({ message: "Giao dịch này đã được xác nhận thuê phòng trước đó" });
    }

    const totalAmount = Number(payment.amount || 0);
    const adminCommission = Math.round(totalAmount * 0.05);
    const landlordPayout = Math.max(totalAmount - adminCommission, 0);

    payment.status = "success";
    payment.admin_commission = adminCommission;
    payment.landlord_payout = landlordPayout;
    payment.rental_confirmed_at = new Date();
    await payment.save();

    room.status = "rented";
    if (payment.user_id) {
      room.tenant_id = payment.user_id;
    }
    await room.save();

    const monthKey = new Date().toISOString().slice(0, 7);
    await Revenue.findOneAndUpdate(
      { month: monthKey, status: "admin_commission" },
      { $inc: { amount: adminCommission } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: "Room rental confirmed successfully",
      payment,
      admin_commission: adminCommission,
      landlord_payout: landlordPayout,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
