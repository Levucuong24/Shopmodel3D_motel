import mongoose from "mongoose";
import User from "./src/modules/user/User.js";

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myhousing_dev");
  const users = await User.find({ role: { $in: ["admin", "staff"] } });
  console.log(JSON.stringify(users.map(u => ({ id: u._id, name: u.full_name, role: u.role })), null, 2));
  process.exit();
}
run().catch(console.error);
