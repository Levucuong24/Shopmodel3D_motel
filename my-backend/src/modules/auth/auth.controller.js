import jwt from "jsonwebtoken";
import User from "../user/User.js";
import { loginService } from "./auth.service.js";

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
  const { full_name, email, password, phone, role } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email đã tồn tại" });
  }

  const user = await User.create({
    full_name,
    email,
    password,
    phone: phone || "",
    role: role || "customer",
  });

  res.status(201).json(buildAuthResponse(user));
};
