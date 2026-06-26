import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { formatPriceByUnit, formatRentalDuration } from "../../utils/rentalFormat.js";
import "../../css/PaymentModal.css";

const PaymentModal = ({ payment, onClose, onSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState(payment?.status || "pending");

  useEffect(() => {
    if (!payment?._id) return;

    const socket = io("http://127.0.0.1:3000");
    socket.emit("join_payment_room", payment._id);

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/${payment._id}`);
        const data = await response.json();

        if (data.status === "success") {
          setPaymentStatus("success");
          onSuccess?.();
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 3000);

    socket.on("payment_updated", (data) => {
      if (data.status === "success") {
        setPaymentStatus("success");
        onSuccess?.();
      }
    });

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
    };
  }, [payment, onSuccess]);

  const basePrice =
    payment?.amount && payment?.rental_duration_value ? payment.amount / payment.rental_duration_value : payment?.amount;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <h2>Thanh toán tiền cọc</h2>
        {paymentStatus === "pending" ? (
          <>
            <p>Vui lòng quét QR để thanh toán. Giao dịch sẽ được tự động xác nhận trong vòng 1-2 phút.</p>
            <p>Chu kỳ thuê: <strong>{formatRentalDuration(payment?.rental_duration_value, payment?.rental_duration_unit)}</strong></p>
            <p>Đơn giá: <strong>{formatPriceByUnit(basePrice, payment?.pricing_unit)}</strong></p>
            <p>Tổng tiền: <strong>{typeof payment?.amount === "number" ? `${payment.amount.toLocaleString("vi-VN")}đ` : "Đang cập nhật"}</strong></p>
            <p>Mã đơn hàng: <strong>{payment?.orderCode}</strong></p>
            
            <div className="qr-placeholder" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              {payment?.qr_url ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payment.qr_url)}`}
                  alt="QR Code"
                  width="200"
                />
              ) : (
                <div className="loader">Đang tạo mã QR...</div>
              )}
            </div>
            
            <div className="loader" style={{ fontSize: '14px', marginTop: '10px' }}>Hệ thống đang tự động theo dõi giao dịch...</div>
            
            <button className="confirm-btn" onClick={() => window.open(payment?.checkoutUrl, '_blank')} style={{ marginTop: '15px' }}>
              Hoặc mở trang thanh toán PayOS
            </button>
          </>
        ) : (
          <div className="success-msg">
            <span className="success-icon">OK</span>
            <p>Thanh toán thành công!</p>
          </div>
        )}
        <button className="close-btn" onClick={onClose} style={{ marginTop: '15px' }}>Đóng</button>
      </div>
    </div>
  );
};

export default PaymentModal;
