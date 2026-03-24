import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      localStorage.setItem("userRole", data.user.role || role);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      navigate(data.user.role === "admin" ? "/admin" : "/customer");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      <div className="login-card">
        <h2 className="login-title">Chào mừng trở lại</h2>
        <p className="login-subtitle">Vui lòng đăng nhập vào tài khoản của bạn</p>

        <div className="role-toggle">
          <button type="button" className={`role-btn ${role === "customer" ? "active" : ""}`} onClick={() => setRole("customer")}>
            Khách hàng
          </button>
          <button type="button" className={`role-btn ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>
            Quản trị viên
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Email</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <label>Mật khẩu</label>
            <div className="input-line"></div>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : `Đăng nhập ${role === "admin" ? "quản trị" : ""}`}
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
