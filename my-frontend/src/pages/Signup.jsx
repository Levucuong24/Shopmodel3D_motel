import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password,
          role: "customer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      alert("Đăng ký thành công");
      navigate("/customer");
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

      <div className="login-card" style={{ marginTop: "20px" }}>
        <h2 className="login-title">Tạo tài khoản mới</h2>
        <p className="login-subtitle">Tham gia hệ thống của chúng tôi ngay hôm nay</p>

        <form className="login-form" onSubmit={handleSignup}>
          <div className="input-group">
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <label>Họ và tên</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Email</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label>Số điện thoại</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <label>Mật khẩu</label>
            <div className="input-line"></div>
          </div>

          <div className="input-group">
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <label>Xác nhận mật khẩu</label>
            <div className="input-line"></div>
          </div>

          <button type="submit" className="login-btn" style={{ marginTop: "15px" }} disabled={submitting}>
            {submitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="signup-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
