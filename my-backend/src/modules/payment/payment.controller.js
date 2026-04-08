import Contract from "../contract/Contract.js";
import Payment from "./Payment.js";
import Revenue from "./Revenue.js";
import Room from "../room/Room.js";
import { createPaymentService, getPaymentByIdService, updatePaymentSuccess } from "./payment.service.js";
import { emitPaymentUpdate } from "../../sockets/payment.socket.js";
import { sendAdminPaymentNotification } from "../../utils/mailer.js";

const getMonthKey = (date) => new Date(date).toISOString().slice(0, 7);

const populateOwnedPaymentQuery = () =>
  Payment.find()
    .populate({
      path: "room_id",
      populate: { path: "created_by", select: "full_name phone" },
    })
    .populate("user_id")
    .sort({ created_at: -1 });

const populatePaymentById = (id) =>
  Payment.findById(id)
    .populate({
      path: "room_id",
      populate: { path: "created_by", select: "full_name phone" },
    })
    .populate("user_id");

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
    customerEmail: payment.customer_email || "Không có email",
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

    const payments = await populateOwnedPaymentQuery();

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

export const getMyRentalPayment = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Chỉ khách thuê mới được xem yêu cầu hủy phòng" });
    }

    const payments = await Payment.find({
      user_id: req.user.id,
      rental_confirmed_at: { $exists: true, $ne: null },
      cancellation_status: { $ne: "approved" },
    })
      .populate({
        path: "room_id",
        populate: { path: "created_by", select: "full_name phone" },
      })
      .sort({ rental_confirmed_at: -1 });

    const activePayment =
      payments.find((payment) => payment.room_id?.tenant_id?.toString?.() === req.user.id) || payments[0] || null;

    res.json(activePayment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const requestRentalCancellation = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Chỉ khách thuê mới được gửi yêu cầu hủy phòng" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "status tenant_id created_by",
    });
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch thuê phòng" });
    }

    if (payment.user_id?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền gửi yêu cầu hủy cho giao dịch này" });
    }

    if (!payment.room_id || payment.room_id.tenant_id?.toString() !== req.user.id) {
      return res.status(400).json({ message: "Phòng này hiện không thuộc lượt thuê của bạn" });
    }

    if (payment.status !== "success" || !payment.rental_confirmed_at) {
      return res.status(400).json({ message: "Chỉ phòng đã thuê thành công mới có thể gửi yêu cầu hủy" });
    }

    if (payment.cancellation_status === "pending") {
      return res.status(400).json({ message: "Yêu cầu hủy phòng này đang chờ chủ phòng xác nhận" });
    }

    if (payment.cancellation_status === "approved") {
      return res.status(400).json({ message: "Phòng này đã được xác nhận hủy trước đó" });
    }

    payment.cancellation_status = "pending";
    payment.cancellation_requested_at = new Date();
    payment.cancellation_note = req.body?.note || "";
    await payment.save();

    const updatedPayment = await populatePaymentById(payment._id);
    res.json({
      message: "Đã gửi yêu cầu hủy phòng, vui lòng chờ chủ phòng xác nhận",
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePayment = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Chỉ chủ nhà mới được chỉnh sửa đặt cọc" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "created_by status",
    });
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch đặt cọc" });
    }

    const ownerId = payment.room_id?.created_by?.toString();
    if (!payment.room_id || ownerId !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa giao dịch này" });
    }

    if (
      payment.status === "success" ||
      payment.rental_confirmed_at ||
      payment.room_id?.status === "rented" ||
      payment.cancellation_status === "pending"
    ) {
      return res.status(400).json({ message: "Giao dịch này không thể chỉnh sửa nữa" });
    }

    const allowedFields = ["customer_name", "customer_email", "amount", "note", "status", "payment_method"];
    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;
      payment[field] = field === "amount" ? Number(req.body[field]) : req.body[field];
    }

    if (payment.amount !== undefined) {
      const amount = Number(payment.amount);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({ message: "Số tiền đặt cọc không hợp lệ" });
      }
      payment.amount = amount;
    }

    payment.admin_commission = 0;
    payment.landlord_payout = 0;

    await payment.save();

    const updatedPayment = await populatePaymentById(payment._id);
    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Chỉ chủ nhà mới được xóa đặt cọc" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "created_by status",
    });
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch đặt cọc" });
    }

    const ownerId = payment.room_id?.created_by?.toString();
    if (!payment.room_id || ownerId !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xóa giao dịch này" });
    }

    if (
      payment.status === "success" ||
      payment.rental_confirmed_at ||
      payment.room_id?.status === "rented" ||
      payment.cancellation_status === "pending"
    ) {
      return res.status(400).json({ message: "Giao dịch này không thể xóa nữa" });
    }

    if (payment.room_id?.status === "reserved") {
      payment.room_id.status = "available";
      await payment.room_id.save();
    }

    await Payment.findByIdAndDelete(payment._id);
    res.json({ message: "Xóa giao dịch đặt cọc thành công", id: payment._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmRentalCancellation = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Chỉ chủ phòng mới được xác nhận hủy thuê" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "created_by status tenant_id",
    });
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch thuê phòng" });
    }

    if (!payment.room_id || payment.room_id.created_by?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xác nhận hủy giao dịch này" });
    }

    if (payment.cancellation_status !== "pending") {
      return res.status(400).json({ message: "Giao dịch này chưa có yêu cầu hủy đang chờ xử lý" });
    }

    if (payment.status !== "success" || !payment.rental_confirmed_at) {
      return res.status(400).json({ message: "Chỉ giao dịch thuê đã xác nhận mới có thể hủy" });
    }

    payment.cancellation_status = "approved";
    payment.cancellation_confirmed_at = new Date();
    payment.status = "cancelled";

    const refundedCommission = Number(payment.admin_commission || 0);
    payment.admin_commission = 0;
    payment.landlord_payout = 0;
    await payment.save();

    payment.room_id.status = "available";
    payment.room_id.tenant_id = null;
    await payment.room_id.save();

    if (payment.contract_id) {
      await Contract.findByIdAndUpdate(payment.contract_id, { status: "cancelled" });
    }

    if (refundedCommission > 0 && payment.rental_confirmed_at) {
      await Revenue.findOneAndUpdate(
        { month: getMonthKey(payment.rental_confirmed_at), status: "admin_commission" },
        { $inc: { amount: -refundedCommission } },
        { new: true }
      );
    }

    const updatedPayment = await populatePaymentById(payment._id);
    emitPaymentUpdate(updatedPayment);

    res.json({
      message: "Đã xác nhận hủy thuê phòng thành công",
      payment: updatedPayment,
    });
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
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

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
    payment.cancellation_status = "none";
    payment.cancellation_requested_at = null;
    payment.cancellation_confirmed_at = null;
    await payment.save();

    room.status = "rented";
    if (payment.user_id) {
      room.tenant_id = payment.user_id;
    }
    await room.save();

    await Revenue.findOneAndUpdate(
      { month: getMonthKey(new Date()), status: "admin_commission" },
      { $inc: { amount: adminCommission } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const updatedPayment = await populatePaymentById(payment._id);
    res.json({
      message: "Room rental confirmed successfully",
      payment: updatedPayment,
      admin_commission: adminCommission,
      landlord_payout: landlordPayout,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
