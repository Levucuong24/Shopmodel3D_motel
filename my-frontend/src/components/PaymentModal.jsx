import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./PaymentModal.css";

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
        throw new Error(data.message || "Không thể xác nhận thanh toán");
      }

      setPaymentStatus("success");
      onSuccess?.();
      alert("Thanh toán thành công!");
    } catch (error) {
      alert(error.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <h2>Thanh toán tiền cọc</h2>
        {paymentStatus === "pending" ? (
          <>
            <p>Vui lòng quét QR để thanh toán. Sau khi chuyển khoản xong, nhấn nút xác nhận bên dưới.</p>
            <div className="qr-placeholder">
              <img
                src={`https://img.vietqr.io/image/MB-0352824919-compact.png?amount=${payment?.amount || 0}&addInfo=${payment?.qr_content}&accountName=LE%20VU%20CUONG`}
                alt="QR Code"
                width="200"
              />
            </div>
            <div className="loader">Đang chờ thanh toán...</div>
            <button className="confirm-btn" onClick={handleConfirmTransfer} disabled={confirming}>
              {confirming ? "Đang xác nhận..." : "Tôi đã chuyển khoản xong"}
            </button>
          </>
        ) : (
          <div className="success-msg">
            <span className="success-icon">✓</span>
            <p>Thanh toán thành công!</p>
          </div>
        )}
        <button className="close-btn" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default PaymentModal;
