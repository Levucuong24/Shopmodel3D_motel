import "dotenv/config";
import mongoose from "mongoose";
import Room from "./src/modules/room/Room.js";

const rooms = [
  {
    name: "Nhà Sinh viên Tân Xã",
    price: 3500000,
    location: "Khu Công Nghệ Cao Hòa Lạc",
    description: "Phòng trọ giá bình dân nhưng đầy đủ tiện nghi thiết yếu dành cho sinh viên khu vực Tân Xã. Gần các chợ đêm và bến xe bus lớn.",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"],
    model_3d_url: "custom_house_1",
    status: "available",
    specs: {
      area: 30,
      layout: "1 Ngủ, 1 Khách",
    },
    amenities: ["Điều hòa", "Nóng lạnh", "Tủ lạnh"],
    pet_policy: "Được phép (dưới 5kg)"
  },
  {
    name: "Phòng trọ cao cấp Bình Yên",
    price: 6000000,
    location: "Khu Công Nghệ Cao Hòa Lạc",
    description: "Căn hộ dịch vụ cao cấp ngay Khu Công Nghệ Cao Hòa Lạc. Được trang bị thiết kế nội thất thông minh, cửa sổ lớn đón nắng và hầm gửi xe miễn phí.",
    images: ["https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1964&auto=format&fit=crop"],
    model_3d_url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb",
    status: "available",
    specs: {
      area: 45,
      layout: "2 Ngủ, 1 Khách",
    },
    amenities: ["Điều hòa", "Nóng lạnh", "Máy giặt", "Tivi", "Ban công"],
    pet_policy: "Không được phép"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await Room.deleteMany({});
    console.log("Old rooms deleted");
    await Room.insertMany(rooms);
    console.log("Seed complete");
    process.exit();
  } catch (error) {
    console.error("Seed error", error);
    process.exit(1);
  }
};

seedDB();
