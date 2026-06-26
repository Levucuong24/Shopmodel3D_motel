import { useEffect } from "react";
import "../../css/PaymentModal.css";

const PaymentModal = ({ payment, onClose }) => {
  useEffect(() => {
    if (payment?.checkoutUrl) {
      const timer = setTimeout(() => {
        window.location.href = payment.checkoutUrl;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [payment]);

  const handleRedirect = () => {
    if (payment?.checkoutUrl) {
      window.location.href = payment.checkoutUrl;
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <h2>Đang chuyển hướng thanh toán...</h2>
        <p>Hệ thống đang kết nối đến cổng thanh toán an toàn PayOS.</p>
        <p>Nếu trình duyệt không tự động chuyển hướng, vui lòng nhấn nút bên dưới.</p>
        
        <div className="loader"></div>
        
        <button className="confirm-btn" onClick={handleRedirect}>
          Đi đến trang thanh toán ngay
        </button>
        
        <button className="close-btn" onClick={onClose} style={{ marginTop: '10px' }}>
          Hủy bỏ
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
