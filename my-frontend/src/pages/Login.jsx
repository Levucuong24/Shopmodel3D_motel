import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('userRole', role); // Save role for conditional rendering
    
    if (role === 'admin') {
      console.log("Admin logged in", email);
      navigate('/admin');
    } else {
      console.log("Customer logged in", email);
      navigate('/customer');
    }
  };

  return (
    <div className="login-container">
      {/* Background animated circles */}
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      <div className="login-card">
        <h2 className="login-title">Chào mừng trở lại</h2>
        <p className="login-subtitle">Vui lòng đăng nhập vào tài khoản của bạn</p>

        {/* Role Toggle Tabs */}
        <div className="role-toggle">
          <button 
            type="button" 
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
          >
            Khách hàng
          </button>
          <button 
            type="button" 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            Quản trị viên
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input 
              type="text" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email hoặc Tên đăng nhập</label>
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

          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="login-btn">
            Đăng nhập {role === 'admin' ? 'Quản trị' : ''}
          </button>
        </form>

        <p className="signup-link">
          Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
        </p>

        <div className="back-link">
            <Link to="/welcome">&larr; Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
