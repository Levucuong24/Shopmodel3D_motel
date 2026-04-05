import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  
  // Signup States
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
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

      navigate(data.user.role === "admin" ? "/admin" : "/customer");
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
          email: signupEmail,
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
            <span className="subtitle">hoặc sử dụng email của bạn để đăng ký</span>
            <input type="text" placeholder="Họ và tên" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input type="email" placeholder="Email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
            <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="password" placeholder="Mật khẩu" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
            <input type="password" placeholder="Xác nhận mật khẩu" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button className="action-btn" type="submit" disabled={signupSubmitting}>
              {signupSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>
        </div>

        {/* Sign In Content */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={handleLogin}>
            <h1>Đăng nhập</h1>
            <span className="subtitle">sử dụng tài khoản của bạn</span>
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

            <Link className="forgot-p" to="/forgot-password">Quên mật khẩu?</Link>
            <button className="action-btn" type="submit" disabled={loginSubmitting}>
              {loginSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <div className="back-link-wrapper" style={{marginTop: "20px"}}>
               <Link className="back-home" to="/welcome">&larr; Quay lại trang chủ</Link>
            </div>
          </form>
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
