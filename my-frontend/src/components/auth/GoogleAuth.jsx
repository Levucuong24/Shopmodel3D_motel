import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { getWelcomePath, setAuthSession } from "../../utils/authStorage.js";

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

      setAuthSession(data.token, data.user);

      navigate(getWelcomePath(data.user));
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
