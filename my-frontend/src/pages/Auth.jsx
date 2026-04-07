import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import GoogleAuth from "../components/auth/GoogleAuth";
import "../css/Login.css";

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const location = useLocation();
  
  // Login States
  const [loginFullName, setLoginFullName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  
  // Captcha States
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isRobotChecked, setIsRobotChecked] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fpFullName, setFpFullName] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpSubmitting, setFpSubmitting] = useState(false);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let text = "";
    for (let i = 0; i < 5; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
  };

  useEffect(() => {
    if (!isSignUp) {
      generateCaptcha();
    }
  }, [isSignUp]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (fpNewPassword !== fpConfirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setFpSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fpFullName, new_password: fpNewPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Khôi phục thất bại");
      }
      alert("Khôi phục mật khẩu thành công!");
      setShowForgotPassword(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setFpSubmitting(false);
    }
  };
  
  
  // Signup States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/signup") {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isRobotChecked) {
      alert("Vui lòng xác nhận bạn không phải là người máy!");
      return;
    }
    if (captchaInput !== captchaText) {
      alert("Mã captcha không khớp, vui lòng nhập lại!");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setLoginSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: loginFullName, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      navigate(data.user.role === "admin" ? "/admin" : data.user.role === "staff" ? "/staff" : "/customer");
    } catch (error) {
      alert(error.message);
      generateCaptcha();
      setCaptchaInput("");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const phoneRegex = /^(032|033|034|035|036|037|038|039|086|096|097|098)\d{7}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số không kèm kí tự đặc biệt và thuộc các đầu số cho phép.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    setSignupSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          password: signupPassword,
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
      setSignupSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`container ${isSignUp ? "right-panel-active" : ""}`} id="container">
        {/* Sign Up Content */}
        <div className="form-container sign-up-container">
          <form className="auth-form" onSubmit={handleSignup}>
            <h1>Tạo tài khoản</h1>
            <span className="subtitle" style={{marginBottom: "10px"}}>Nhập thông tin cá nhân của bạn để đăng ký</span>
            <GoogleAuth width="280" />
            <div style={{ margin: '15px 0', fontSize: '12px', color: '#999' }}>HOẶC ĐĂNG KÝ BẰNG TÊN</div>
            <input type="text" placeholder="Họ và tên" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="password" placeholder="Mật khẩu" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
            <input type="password" placeholder="Xác nhận mật khẩu" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button className="action-btn" type="submit" disabled={signupSubmitting}>
              {signupSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>
        </div>

        {/* Sign In / Forgot Password Content */}
        <div className="form-container sign-in-container">
          {showForgotPassword ? (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <h1>Khôi phục mật khẩu</h1>
              <span className="subtitle">Nhập thông tin xác thực để đổi mật khẩu cá nhân</span>
              <input type="text" placeholder="Họ và tên" required value={fpFullName} onChange={(e) => setFpFullName(e.target.value)} />
              <input type="password" placeholder="Mật khẩu mới" required value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)} />
              <input type="password" placeholder="Xác nhận mật khẩu" required value={fpConfirmPassword} onChange={(e) => setFpConfirmPassword(e.target.value)} />
              
              <button className="action-btn" type="submit" disabled={fpSubmitting} style={{ marginTop: '10px' }}>
                {fpSubmitting ? "Đang xử lý..." : "Xác nhận đổi"}
              </button>
              <div className="back-link-wrapper" style={{marginTop: "20px"}}>
                 <span className="back-home" onClick={() => setShowForgotPassword(false)} style={{cursor: "pointer", color: "#333", fontSize: "14px", transition: "color 0.3s"}} onMouseOver={(e)=>e.target.style.color="#ff4b2b"} onMouseOut={(e)=>e.target.style.color="#333"}>&larr; Quay lại Đăng nhập</span>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLogin}>
              <h1>Đăng nhập</h1>
              <span className="subtitle" style={{marginBottom: "10px"}}>sử dụng tài khoản của bạn</span>
              <GoogleAuth width="280" />
              <div style={{ margin: '15px 0', fontSize: '12px', color: '#999' }}>HOẶC ĐĂNG NHẬP BẰNG TÊN</div>
              <input type="text" placeholder="Họ và tên" required value={loginFullName} onChange={(e) => setLoginFullName(e.target.value)} />
              <input type="password" placeholder="Mật khẩu" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              
              <div className="captcha-wrapper">
                <div className="captcha-display" onClick={generateCaptcha} title="Nhấn để đổi mã">
                  {captchaText}
                </div>
                <input 
                  type="text" 
                  placeholder="Nhập mã captcha" 
                  required 
                  value={captchaInput} 
                  onChange={(e) => setCaptchaInput(e.target.value)} 
                  className="captcha-input"
                />
              </div>
              
              <label className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={isRobotChecked} 
                  onChange={(e) => setIsRobotChecked(e.target.checked)} 
                />
                <span className="checkmark"></span>
                Tôi không phải là người máy
              </label>

              <span className="forgot-p" onClick={() => setShowForgotPassword(true)} style={{cursor: "pointer", fontSize: "14px", margin: "15px 0", transition: "color 0.3s"}} onMouseOver={(e)=>e.target.style.color="#ff4b2b"} onMouseOut={(e)=>e.target.style.color="#333"}>Quên mật khẩu?</span>
              <button className="action-btn" type="submit" disabled={loginSubmitting}>
                {loginSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </button>
              <div className="back-link-wrapper" style={{marginTop: "20px"}}>
                 <Link className="back-home" to="/welcome">&larr; Quay lại trang chủ</Link>
              </div>
            </form>
          )}
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 style={{ transform: "translateX(-20px)" }}>Trọ FPT mừng bạn về nhà</h1>
              <p style={{ transform: "translateX(-20px)" }}>Để duy trì kết nối với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn</p>
              <button className="ghost action-btn" id="signIn" onClick={() => setIsSignUp(false)} style={{ transform: "translateX(-20px)" }}>
                Đăng nhập
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 style={{ transform: "translateX(20px)" }}>Trọ FPT kính chào quý khách!</h1>
              <p style={{ transform: "translateX(20px)" }}>Nhập thông tin cá nhân của bạn và bắt đầu hành trình với chúng tôi</p>
              <button className="ghost action-btn" id="signUp" onClick={() => setIsSignUp(true)} style={{ transform: "translateX(20px)" }}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
