import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const GoogleAuth = ({ width }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi đăng nhập Google");

      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      navigate(data.user.role === "admin" ? "/admin" : data.user.role === "staff" ? "/staff" : "/customer");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleError = () => {
    alert("Đăng nhập Google thất bại! API thiếu cấu hình.");
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      shape="pill"
      width={width || "280"}
    />
  );
};

export default GoogleAuth;
