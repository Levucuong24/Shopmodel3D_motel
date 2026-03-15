import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    // Simulate signup logic here
    console.log("Signing up with", fullName, email);
    alert("Đăng ký thành công! Đang chuyển hướng đến Đăng nhập...");
    navigate('/login');
  };

  return (
    <div className="login-container">
      {/* Background animated circles */}
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      <div className="login-card" style={{ marginTop: '20px' }}>
        <h2 className="login-title">Tạo tài khoản mới</h2>
        <p className="login-subtitle">Tham gia hệ thống của chúng tôi ngay hôm nay</p>

        <form className="login-form" onSubmit={handleSignup}>
          
          <div className="input-group">
            <input 
              type="text" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <label>Họ và tên</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Mật khẩu</label>
            <div className="input-line"></div>
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label>Xác nhận mật khẩu</label>
            <div className="input-line"></div>
          </div>

          <button type="submit" className="login-btn" style={{ marginTop: '15px' }}>Đăng ký</button>
        </form>

        <p className="signup-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
