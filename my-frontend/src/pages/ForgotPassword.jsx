import '../css/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ForgotPassword() {
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, new_password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Khôi phục thất bại");
      }

      alert("Khôi phục mật khẩu thành công!");
      navigate('/login');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background animated circles */}
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      <div className="login-card">
        <h2 className="login-title">Khôi phục mật khẩu</h2>
        <p className="login-subtitle">Nhập thông tin để đặt lại mật khẩu của bạn</p>

        <form className="login-form" onSubmit={handleReset}>
          
          <div className="input-group">
            <input 
              type="text" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <label>Họ và Tên</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input 
              type="password" 
              required 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label>New Password</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label>Confirm Password</label>
            <div className="input-line"></div>
          </div>

          <button type="submit" className="login-btn" style={{ marginTop: '20px' }} disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>

        <div className="back-link" style={{ marginTop: '30px' }}>
            <Link to="/login">&larr; Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
