import Contract from "../modules/contract/Contract.js";
import Payment from "../modules/payment/Payment.js";
import Room from "../modules/room/Room.js";

export const normalizeRentalDurationValue = (value) => {
  const normalized = Number(value || 1);

  if (!Number.isInteger(normalized) || normalized < 1) {
    return 1;
  }

  return normalized;
};

export const calculateRentalEndAt = (startAt, unit, durationValue) => {
  const rentalEndAt = new Date(startAt);
  const duration = normalizeRentalDurationValue(durationValue);

  switch (unit) {
    case "month":
      rentalEndAt.setMonth(rentalEndAt.getMonth() + duration);
      break;
    case "week":
      rentalEndAt.setDate(rentalEndAt.getDate() + duration * 7);
      break;
    case "day":
      rentalEndAt.setDate(rentalEndAt.getDate() + duration);
      break;
    case "hour":
      rentalEndAt.setHours(rentalEndAt.getHours() + duration);
      break;
    case "minute":
      rentalEndAt.setMinutes(rentalEndAt.getMinutes() + duration);
      break;
    default:
      rentalEndAt.setMonth(rentalEndAt.getMonth() + duration);
      break;
  }

  return rentalEndAt;
};

export const clearRoomRentalState = async (room) => {
  room.status = "available";
  room.tenant_id = null;
  room.current_rental_start_at = null;
  room.current_rental_end_at = null;
  room.current_rental_payment_id = null;
  await room.save();
};

export const releaseExpiredRentals = async () => {
  const now = new Date();
  const expiredPayments = await Payment.find({
    rental_confirmed_at: { $ne: null },
    rental_end_at: { $lte: now },
    rental_released_at: null,
  });

  for (const payment of expiredPayments) {
    const room = payment.room_id ? await Room.findById(payment.room_id) : null;

    if (room && room.current_rental_payment_id?.toString() === payment._id.toString()) {
      await clearRoomRentalState(room);
    }

    payment.rental_released_at = now;
    payment.rental_release_reason = "expired";
    await payment.save();

    if (payment.contract_id) {
      await Contract.findByIdAndUpdate(payment.contract_id, { status: "expired" });
    }
  }

  return expiredPayments.length;
};

export const startRentalExpiryMonitor = () => {
  releaseExpiredRentals().catch((error) => {
    console.error("Failed to release expired rentals on startup:", error);
  });

  return setInterval(() => {
    releaseExpiredRentals().catch((error) => {
      console.error("Failed to release expired rentals:", error);
    });
  }, 30 * 1000);
};
