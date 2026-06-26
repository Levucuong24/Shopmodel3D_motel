import Contract from "../contract/Contract.js";
import Payment from "./Payment.js";
import Revenue from "./Revenue.js";
import Room from "../room/Room.js";
import { createPaymentService, getPaymentByIdService, updatePaymentSuccess, updatePaymentSuccessByOrderCode } from "./payment.service.js";
import { emitPaymentUpdate } from "../../sockets/payment.socket.js";
import { sendAdminPaymentNotification } from "../../utils/mailer.js";
import {
  calculateRentalEndAt,
  clearRoomRentalState,
  normalizeRentalDurationValue,
  releaseExpiredRentals,
} from "../../utils/rental.js";
import PayOSPackage from "@payos/node";

const PayOS = PayOSPackage.PayOS || PayOSPackage;
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID || "client_id",
  process.env.PAYOS_API_KEY || "api_key",
  process.env.PAYOS_CHECKSUM_KEY || "checksum_key"
);

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

    if (room.status === "rented") {
      await releaseExpiredRentals();
      const refreshedRoom = await Room.findById(room_id);
      if (refreshedRoom?.status === "rented") {
        return res.status(400).json({ message: "Phong nay hien dang co nguoi thue" });
      }
    }

    const rentalDurationValue = normalizeRentalDurationValue(req.body.rental_duration_value);
    const pricingUnit = room.price_unit || "month";

    paymentPayload = {
      ...paymentPayload,
      room_id: room._id,
      amount: Number(room.price || 0) * rentalDurationValue,
      pricing_unit: pricingUnit,
      rental_duration_unit: pricingUnit,
      rental_duration_value: rentalDurationValue,
      note: req.body.note || `Thanh toan cho phong ${room.name}`,
    };
  }

  const orderCode = Number(String(Date.now()).slice(-9) + Math.floor(Math.random() * 10).toString());
  const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";
  
  const body = {
    orderCode,
    amount: paymentPayload.amount,
    description: paymentPayload.note ? paymentPayload.note.substring(0, 25) : "Thanh toan don hang",
    returnUrl: `${DOMAIN}/customer-dashboard?tab=rented`,
    cancelUrl: `${DOMAIN}/customer-dashboard?tab=rented`
  };

  try {
    const paymentLinkRes = await payos.createPaymentLink(body);
    paymentPayload.orderCode = orderCode;
    paymentPayload.checkoutUrl = paymentLinkRes.checkoutUrl;
    paymentPayload.qr_url = paymentLinkRes.qrCode; // PayOS trả về chuỗi VietQR trong trường qrCode
  } catch (error) {
    console.error("PayOS Error:", error);
    return res.status(500).json({ message: "Lỗi tạo link thanh toán PayOS" });
  }

  const payment = await createPaymentService(paymentPayload);
  res.json(payment);
};

export const paymentWebhook = async (req, res) => {
  try {
    const webhookData = payos.verifyPaymentWebhookData(req.body);

    if (webhookData.code === "00") {
      const orderCode = webhookData.orderCode;
      const paymentToUpdate = await Payment.findOne({ orderCode });
      
      if (!paymentToUpdate) {
        return res.json({ message: "Payment not found" });
      }

      if (paymentToUpdate.status === "success") {
        return res.json({ message: "Payment already processed" });
      }

      const payment = await updatePaymentSuccessByOrderCode(orderCode);

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
        customerName: payment.customer_name || "Khach hang",
        customerEmail: payment.customer_email || "Khong co email",
        amount: payment.amount,
      });
    }

    res.json({ message: "Payment success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(400).json({ message: "Invalid webhook data" });
  }
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
      return res.status(403).json({ message: "Chi chu nha moi duoc quan ly dat coc" });
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
      return res.status(403).json({ message: "Chi khach thue moi duoc xem phong dang thue" });
    }

    const payments = await Payment.find({
      user_id: req.user.id,
      status: "success",
      rental_released_at: null,
      $or: [
        { rental_end_at: { $gt: new Date() } },
        { rental_end_at: null }
      ],
      cancellation_status: { $ne: "approved" },
    })
      .populate({
        path: "room_id",
        populate: { path: "created_by", select: "full_name phone" },
      })
      .sort({ created_at: -1 });

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
      return res.status(403).json({ message: "Chi khach thue moi duoc huy phong" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "status tenant_id created_by current_rental_payment_id",
    });
    if (!payment) {
      return res.status(404).json({ message: "Khong tim thay giao dich thue phong" });
    }

    if (payment.user_id?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen dung giao dich nay" });
    }

    if (!payment.room_id) {
      return res.status(400).json({ message: "Giao dich nay khong gan voi phong nao" });
    }

    if (payment.status !== "success") {
      return res.status(400).json({ message: "Chi phong da thanh toan moi co the huy" });
    }

    if (payment.rental_end_at && payment.rental_end_at <= new Date()) {
      return res.status(400).json({ message: "Luot thue nay da het han" });
    }

    if (payment.cancellation_status === "approved") {
      return res.status(400).json({ message: "Phong nay hoac da duoc huy roi" });
    }

    // Cancel instantly
    payment.cancellation_status = "approved";
    payment.cancellation_requested_at = new Date();
    payment.cancellation_confirmed_at = new Date();
    payment.status = "cancelled";
    payment.rental_released_at = new Date();
    payment.rental_release_reason = "cancelled_by_user";
    
    // We optionally keep or reset commission dependending on business logic
    // We'll revert commission similarly to how landlord cancels:
    const refundedCommission = Number(payment.admin_commission || 0);
    payment.admin_commission = 0;
    payment.landlord_payout = 0;
    
    await payment.save();

    await clearRoomRentalState(payment.room_id);

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
      message: "Da huy phong thanh cong",
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePayment = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Chi chu nha moi duoc chinh sua dat coc" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "created_by status",
    });
    if (!payment) {
      return res.status(404).json({ message: "Khong tim thay giao dich dat coc" });
    }

    const ownerId = payment.room_id?.created_by?.toString();
    if (!payment.room_id || ownerId !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen chinh sua giao dich nay" });
    }

    if (
      payment.rental_confirmed_at ||
      payment.room_id?.status === "rented" ||
      payment.cancellation_status === "pending"
    ) {
      return res.status(400).json({ message: "Giao dich nay khong the chinh sua nua" });
    }

    const allowedFields = ["customer_name", "customer_email", "amount", "note", "status", "payment_method"];
    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;
      payment[field] = field === "amount" ? Number(req.body[field]) : req.body[field];
    }

    if (payment.amount !== undefined) {
      const amount = Number(payment.amount);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({ message: "So tien dat coc khong hop le" });
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
      return res.status(403).json({ message: "Chi chu nha moi duoc xoa dat coc" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "created_by status",
    });
    if (!payment) {
      return res.status(404).json({ message: "Khong tim thay giao dich dat coc" });
    }

    const ownerId = payment.room_id?.created_by?.toString();
    if (!payment.room_id || ownerId !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen xoa giao dich nay" });
    }

    if (
      payment.rental_confirmed_at ||
      payment.room_id?.status === "rented" ||
      payment.cancellation_status === "pending"
    ) {
      return res.status(400).json({ message: "Giao dich nay khong the xoa nua" });
    }

    if (payment.room_id?.status === "reserved") {
      payment.room_id.status = "available";
      await payment.room_id.save();
    }

    await Payment.findByIdAndDelete(payment._id);
    res.json({ message: "Xoa giao dich dat coc thanh cong", id: payment._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmRentalCancellation = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Chi chu phong moi duoc xac nhan huy thue" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: "room_id",
      select: "created_by status tenant_id current_rental_payment_id",
    });
    if (!payment) {
      return res.status(404).json({ message: "Khong tim thay giao dich thue phong" });
    }

    if (!payment.room_id || payment.room_id.created_by?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen xac nhan huy giao dich nay" });
    }

    if (payment.cancellation_status !== "pending") {
      return res.status(400).json({ message: "Giao dich nay chua co yeu cau huy dang cho xu ly" });
    }

    if (payment.status !== "success" || !payment.rental_confirmed_at) {
      return res.status(400).json({ message: "Chi giao dich thue da xac nhan moi co the huy" });
    }

    payment.cancellation_status = "approved";
    payment.cancellation_confirmed_at = new Date();
    payment.status = "cancelled";
    payment.rental_released_at = new Date();
    payment.rental_release_reason = "cancelled";

    const refundedCommission = Number(payment.admin_commission || 0);
    payment.admin_commission = 0;
    payment.landlord_payout = 0;
    await payment.save();

    await clearRoomRentalState(payment.room_id);

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
      message: "Da xac nhan huy thue phong thanh cong",
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminRevenue = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chi admin moi duoc xem ke toan doanh thu" });
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
      return res.status(403).json({ message: "Chi chu nha moi duoc xac nhan thue phong" });
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
      return res.status(403).json({ message: "Ban khong co quyen xac nhan giao dich nay" });
    }

    if (room.status === "rented" && room.current_rental_end_at && room.current_rental_end_at <= new Date()) {
      await releaseExpiredRentals();
      await room.reload?.();
    }

    const refreshedRoom = await Room.findById(room._id);
    if (payment.rental_confirmed_at || refreshedRoom?.status === "rented") {
      return res.status(400).json({ message: "Giao dich nay da duoc xac nhan thue phong truoc do" });
    }

    const totalAmount = Number(payment.amount || 0);
    const adminCommission = Math.round(totalAmount * 0.05);
    const landlordPayout = Math.max(totalAmount - adminCommission, 0);
    const rentalConfirmedAt = new Date();
    const rentalDurationUnit = payment.rental_duration_unit || payment.pricing_unit || refreshedRoom.price_unit || "month";
    const rentalDurationValue = normalizeRentalDurationValue(payment.rental_duration_value);
    const rentalEndAt = calculateRentalEndAt(rentalConfirmedAt, rentalDurationUnit, rentalDurationValue);

    payment.status = "success";
    payment.admin_commission = adminCommission;
    payment.landlord_payout = landlordPayout;
    payment.rental_confirmed_at = rentalConfirmedAt;
    payment.rental_start_at = rentalConfirmedAt;
    payment.rental_end_at = rentalEndAt;
    payment.rental_duration_unit = rentalDurationUnit;
    payment.rental_duration_value = rentalDurationValue;
    payment.pricing_unit = rentalDurationUnit;
    payment.rental_released_at = null;
    payment.rental_release_reason = null;
    payment.cancellation_status = "none";
    payment.cancellation_requested_at = null;
    payment.cancellation_confirmed_at = null;
    await payment.save();

    refreshedRoom.status = "rented";
    refreshedRoom.current_rental_start_at = rentalConfirmedAt;
    refreshedRoom.current_rental_end_at = rentalEndAt;
    refreshedRoom.current_rental_payment_id = payment._id;
    if (payment.user_id) {
      refreshedRoom.tenant_id = payment.user_id;
    }
    await refreshedRoom.save();

    await Revenue.findOneAndUpdate(
      { month: getMonthKey(rentalConfirmedAt), status: "admin_commission" },
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
