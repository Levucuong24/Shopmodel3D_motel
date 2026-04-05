import jwt from "jsonwebtoken";
import User from "../user/User.js";
import { loginService } from "./auth.service.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client("399778715347-5qmr901ulefh93194ol123ekgdcilrn4.apps.googleusercontent.com");

const buildAuthResponse = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  return { token, user };
};

export const login = async (req, res) => {
  const { full_name, password } = req.body;

  const user = await loginService(full_name, password);
  if (!user) {
    return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
  }

  res.json(buildAuthResponse(user));
};

export const register = async (req, res) => {
  const { full_name, password, phone, role } = req.body;

  if (!full_name || !password) {
    return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
  }

  const phoneRegex = /^(032|033|034|035|036|037|038|039|086|096|097|098)\d{7}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Số điện thoại không hợp lệ hoặc sai đầu số quy định" });
  }

  const existingUser = await User.findOne({ full_name });
  if (existingUser) {
    return res.status(409).json({ message: "Họ và tên này đã được dùng để đăng ký" });
  }

  const user = await User.create({
    full_name,
    password,
    phone: phone || "",
    role: role || "customer",
  });

  res.status(201).json(buildAuthResponse(user));
};

export const resetPassword = async (req, res) => {
  const { full_name, new_password } = req.body;

  if (!full_name || !new_password) {
    return res.status(400).json({ message: "Thiếu thông tin khôi phục mật khẩu" });
  }

  const user = await User.findOne({ full_name });
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy tài khoản với Họ và tên này" });
  }

  user.password = new_password;
  await user.save();

  res.json({ message: "Đổi mật khẩu thành công" });
};

export const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Thiếu token từ Google" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "399778715347-5qmr901ulefh93194ol123ekgdcilrn4.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    
    const { email, name, picture } = payload;
    
    let user = await User.findOne({ email });
    if (!user) {
      let new_full_name = name;
      const existingName = await User.findOne({ full_name: name });
      if (existingName) {
        new_full_name = `${name} ${Date.now().toString().slice(-4)}`;
      }

      user = await User.create({
        full_name: new_full_name,
        email: email,
        password: "google-oauth-" + Date.now(),
        role: "customer",
        avatar: picture
      });
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Xác thực Google thất bại" });
  }
};
