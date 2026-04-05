import User from "../user/User.js";

export const loginService = async (full_name, password) => {
  return await User.findOne({ full_name, password });
};