import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    // Simulate password reset logic here
    console.log("Password reset requested for", email);
    alert("Liên kết khôi phục đã được gửi vào email của bạn!");
    navigate('/login');
  };

  return (
    <div className="login-container">
      {/* Background animated circles */}
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      <div className="login-card">
        <h2 className="login-title">Quên mật khẩu?</h2>
        <p className="login-subtitle">Nhập email của bạn để nhận liên kết khôi phục</p>

        <form className="login-form" onSubmit={handleReset}>
          
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

          <button type="submit" className="login-btn" style={{ marginTop: '20px' }}>Gửi liên kết khôi phục</button>
        </form>

        <div className="back-link" style={{ marginTop: '30px' }}>
            <Link to="/login">&larr; Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
