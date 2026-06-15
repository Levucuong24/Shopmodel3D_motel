import '../css/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Vui lòng nhập Email!");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Yêu cầu thất bại với mã lỗi ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error ? `${data.message}: ${data.error}` : (data.message || "Yêu cầu OTP thất bại"));
      }
      alert("Mã OTP đã được gửi về Gmail của bạn!");
      setStep(2);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Vui lòng nhập mã OTP!");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Yêu cầu thất bại với mã lỗi ${response.status}`);
      }

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
        <p className="login-subtitle">
          {step === 1 
            ? "Nhập Email liên kết để nhận mã xác nhận OTP" 
            : "Nhập mã OTP từ Gmail và mật khẩu mới"
          }
        </p>

        <form className="login-form" onSubmit={step === 1 ? handleRequestOTP : handleResetPassword}>
          
          {step === 1 ? (
            <div className="input-group">
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email của bạn</label>
              <div className="input-line"></div>
            </div>
          ) : (
            <>
              <div className="input-group">
                <input 
                  type="text" 
                  required 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <label>Nhập mã OTP (6 số)</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <input 
                  type="password" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <label>Mật khẩu mới</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <input 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label>Xác nhận mật khẩu mới</label>
                <div className="input-line"></div>
              </div>
            </>
          )}

          {step === 1 ? (
            <button type="submit" className="login-btn" style={{ marginTop: '20px' }} disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px' }}>
              <button 
                type="button" 
                className="login-btn" 
                onClick={() => setStep(1)} 
                style={{ background: '#71717a', flex: 1 }}
                disabled={isSubmitting}
              >
                Quay lại
              </button>
              <button type="submit" className="login-btn" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          )}
        </form>

        <div className="back-link" style={{ marginTop: '30px' }}>
            <Link to="/login">&larr; Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
