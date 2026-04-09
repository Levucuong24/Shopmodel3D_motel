import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { formatPriceByUnit, formatRentalDuration } from "../../utils/rentalFormat.js";
import "../../css/PaymentModal.css";

const PaymentModal = ({ payment, onClose, onSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState(payment?.status || "pending");
  const [confirming, setConfirming] = useState(false);

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

  const handleConfirmTransfer = async () => {
    if (!payment?.qr_content) return;

    setConfirming(true);

    try {
      const response = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qr_content: payment.qr_content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Khong the xac nhan thanh toan");
      }

      setPaymentStatus("success");
      onSuccess?.();
      alert("Thanh toan thanh cong!");
    } catch (error) {
      alert(error.message);
    } finally {
      setConfirming(false);
    }
  };

  const basePrice =
    payment?.amount && payment?.rental_duration_value ? payment.amount / payment.rental_duration_value : payment?.amount;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <h2>Thanh toan tien coc</h2>
        {paymentStatus === "pending" ? (
          <>
            <p>Vui long quet QR de thanh toan. Sau khi chuyen khoan xong, nhan nut xac nhan ben duoi.</p>
            <p>Chu ky thue: <strong>{formatRentalDuration(payment?.rental_duration_value, payment?.rental_duration_unit)}</strong></p>
            <p>Don gia: <strong>{formatPriceByUnit(basePrice, payment?.pricing_unit)}</strong></p>
            <p>Tong tien: <strong>{typeof payment?.amount === "number" ? `${payment.amount.toLocaleString("vi-VN")}d` : "Dang cap nhat"}</strong></p>
            <div className="qr-placeholder">
              <img
                src={`https://img.vietqr.io/image/MB-0352824919-compact.png?amount=${payment?.amount || 0}&addInfo=${payment?.qr_content}&accountName=LE%20VU%20CUONG`}
                alt="QR Code"
                width="200"
              />
            </div>
            <div className="loader">Dang cho thanh toan...</div>
            <button className="confirm-btn" onClick={handleConfirmTransfer} disabled={confirming}>
              {confirming ? "Dang xac nhan..." : "Toi da chuyen khoan xong"}
            </button>
          </>
        ) : (
          <div className="success-msg">
            <span className="success-icon">OK</span>
            <p>Thanh toan thanh cong!</p>
          </div>
        )}
        <button className="close-btn" onClick={onClose}>Dong</button>
      </div>
    </div>
  );
};

export default PaymentModal;
