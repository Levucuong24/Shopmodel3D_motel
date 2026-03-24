import User from "../models/User.js";

export const loginService = async (email, password) => {
  return await User.findOne({ email, password });
};