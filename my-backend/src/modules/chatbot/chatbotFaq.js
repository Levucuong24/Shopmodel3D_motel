const SUPPORT_LINK =
  "<a href='https://www.facebook.com/le.vu.cuong.513937' target='_blank' rel='noreferrer' style='color: #ff4b2b; font-weight: bold; text-decoration: underline;'>Facebook cua toi</a>";

const formatPrice = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "lien he";
  }

  return `${value.toLocaleString("vi-VN")}d`;
};

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value = "") =>
  normalizeText(value)
    .split(" ")
    .filter((token) => token && token.length > 1);

const uniqueById = (rooms = []) => {
  const seen = new Set();
  return rooms.filter((room) => {
    const id = room?._id?.toString?.() || room?.id?.toString?.();
    if (!id || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

const buildRoomContext = (rooms = []) => {
  const publicRooms = rooms.filter((room) => room.approval_status === "approved");
  const visibleRooms = publicRooms.length > 0 ? publicRooms : rooms;
  const availableRooms = visibleRooms.filter((room) => room.status === "available");
  const pricedRooms = [...availableRooms]
    .filter((room) => typeof room.price === "number" && !Number.isNaN(room.price))
    .sort((a, b) => a.price - b.price);
  const model3dRooms = availableRooms.filter((room) => room.model_3d_url);
  const petFriendlyRooms = availableRooms.filter((room) => normalizeText(room.pet_policy || "").includes("cho phep"));
  const roomsWithAmenities = availableRooms.filter((room) => Array.isArray(room.amenities) && room.amenities.length > 0);
  const roomsWithArea = availableRooms.filter((room) => typeof room.specs?.area === "number");

  return {
    visibleRooms,
    availableRooms,
    pricedRooms,
    model3dRooms,
    petFriendlyRooms,
    roomsWithAmenities,
    roomsWithArea,
    cheapestRoom: pricedRooms[0] || null,
    mostExpensiveRoom: pricedRooms[pricedRooms.length - 1] || null,
    minPrice: pricedRooms[0]?.price ?? null,
    maxPrice: pricedRooms[pricedRooms.length - 1]?.price ?? null,
  };
};

const defaultSuggestions = (ctx, limit = 3) => ctx.availableRooms.slice(0, limit);

const summarizeRoom = (room) => {
  if (!room) {
    return "Hien tai minh chua tim thay phong phu hop.";
  }

  const area = typeof room.specs?.area === "number" ? `${room.specs.area}m2` : "chua cap nhat dien tich";
  return `${room.name} tai ${room.location || "chua cap nhat"}, gia ${formatPrice(room.price)}, ${area}`;
};

const getRoomsByPrice = (ctx, mode) => {
  if (mode === "cheap") {
    return ctx.pricedRooms.slice(0, 3);
  }

  if (mode === "premium") {
    return [...ctx.pricedRooms].reverse().slice(0, 3);
  }

  if (mode === "mid") {
    if (ctx.pricedRooms.length <= 3) {
      return ctx.pricedRooms.slice(0, 3);
    }
    const middle = Math.floor(ctx.pricedRooms.length / 2);
    return ctx.pricedRooms.slice(Math.max(0, middle - 1), middle + 2);
  }

  return defaultSuggestions(ctx);
};

const getRoomsByArea = (ctx, mode) => {
  const rooms = [...ctx.roomsWithArea].sort((a, b) => a.specs.area - b.specs.area);
  if (!rooms.length) {
    return [];
  }

  if (mode === "small") {
    return rooms.slice(0, 3);
  }

  if (mode === "large") {
    return rooms.reverse().slice(0, 3);
  }

  return rooms.slice(0, 3);
};

const getRoomsByAmenity = (ctx, keywords = []) => {
  const normalizedKeywords = keywords.map(normalizeText);
  return uniqueById(
    ctx.availableRooms.filter((room) =>
      normalizedKeywords.some((keyword) =>
        (room.amenities || []).some((item) => normalizeText(item).includes(keyword))
      )
    )
  ).slice(0, 3);
};

const getRoomsByLocationKeyword = (ctx, keywords = []) => {
  const normalizedKeywords = keywords.map(normalizeText);
  return uniqueById(
    ctx.availableRooms.filter((room) =>
      normalizedKeywords.some((keyword) => normalizeText(room.location || "").includes(keyword))
    )
  ).slice(0, 3);
};

const FAQ_INTENT_HANDLERS = {
  sales_greeting: (ctx) => ({
    reply:
      ctx.availableRooms.length > 0
        ? `Chao ban, hien tai ben minh dang co ${ctx.availableRooms.length} phong trong. Ban cho minh biet muc gia, khu vuc hoac nhu cau de minh tu van nhanh hon.`
        : "Chào bạn, mình có thể tư vấn phòng theo giá, khu vực, tiện ích, lịch xem và thanh toán. Hiện tại mình chưa thấy phòng trống sẵn sàng để gợi ý.",
    suggestions: defaultSuggestions(ctx),
  }),
  sales_overview: (ctx) => ({
    reply:
      ctx.availableRooms.length > 0
        ? `Ben minh hien co ${ctx.availableRooms.length} phong trong, gia dao dong tu ${formatPrice(ctx.minPrice)} den ${formatPrice(ctx.maxPrice)}. Ban co the noi ro ngan sach va khu vuc mong muon de minh loc nhanh.`
        : "Hiện tại mình chưa thấy phòng trống sẵn sàng tư vấn, nhưng vẫn có thể giải thích quy trình xem phòng, cọc, thanh toán và hợp đồng cho bạn.",
    suggestions: defaultSuggestions(ctx),
  }),
  recommend_available: (ctx) => ({
    reply:
      ctx.availableRooms.length > 0
        ? "Minh dang goi y nhanh 3 phong con trong de ban tham khao truoc. Neu muon loc theo gia, khu vuc hoac tien ich, ban cu noi them yeu cau."
        : "Hien tai minh chua thay phong trong nao co the goi y ngay.",
    suggestions: defaultSuggestions(ctx),
  }),
  recommend_budget_low: (ctx) => {
    const suggestions = getRoomsByPrice(ctx, "cheap");
    return {
      reply:
        suggestions.length > 0
          ? `Neu ban uu tien tiet kiem chi phi, minh de xuat nhom phong gia mem nhat hien tai. Phong dau tien la ${summarizeRoom(suggestions[0])}.`
          : "Hien tai minh chua co du lieu phong gia mem de goi y.",
      suggestions,
    };
  },
  recommend_budget_mid: (ctx) => {
    const suggestions = getRoomsByPrice(ctx, "mid");
    return {
      reply:
        suggestions.length > 0
          ? "Neu ban muon can bang giua gia va chat luong, minh dang goi y nhom phong tam gia trung binh de de chon."
          : "Hien tai minh chua loc duoc nhom phong tam gia trung binh.",
      suggestions,
    };
  },
  recommend_budget_high: (ctx) => {
    const suggestions = getRoomsByPrice(ctx, "premium");
    return {
      reply:
        suggestions.length > 0
          ? `Neu ban uu tien phong tot hon ve muc gia, minh de xuat nhom phong cao gia hien co. Noi bat la ${summarizeRoom(suggestions[0])}.`
          : "Hien tai minh chua co phong o nhom gia cao de goi y.",
      suggestions,
    };
  },
  cheapest_room: (ctx) => ({
    reply: ctx.cheapestRoom ? `Phong re nhat hien tai la ${summarizeRoom(ctx.cheapestRoom)}.` : "Hien tai minh chua tim duoc phong gia thap nhat.",
    suggestions: ctx.cheapestRoom ? [ctx.cheapestRoom] : [],
  }),
  expensive_room: (ctx) => ({
    reply: ctx.mostExpensiveRoom
      ? `Phong gia cao nhat dang mo ban hien tai la ${summarizeRoom(ctx.mostExpensiveRoom)}.`
      : "Hien tai minh chua tim duoc phong gia cao nhat de tu van.",
    suggestions: ctx.mostExpensiveRoom ? [ctx.mostExpensiveRoom] : [],
  }),
  room_price_range: (ctx) => ({
    reply:
      ctx.minPrice !== null && ctx.maxPrice !== null
        ? `Gia phong con trong hien nay nam trong khoang ${formatPrice(ctx.minPrice)} den ${formatPrice(ctx.maxPrice)}.`
        : "Hien tai minh chua tong hop duoc khoang gia phong.",
    suggestions: defaultSuggestions(ctx),
  }),
  room_area_small: (ctx) => {
    const suggestions = getRoomsByArea(ctx, "small");
    return {
      reply:
        suggestions.length > 0
          ? "Neu ban can phong gon de o mot minh hoac toi uu chi phi, minh dang goi y nhom phong co dien tich nho."
          : "Hien tai minh chua thay du lieu dien tich de loc phong nho.",
      suggestions,
    };
  },
  room_area_large: (ctx) => {
    const suggestions = getRoomsByArea(ctx, "large");
    return {
      reply:
        suggestions.length > 0
          ? "Neu ban can khong gian rong hon cho o ghep hoac o thoai mai, minh dang goi y nhom phong co dien tich lon."
          : "Hien tai minh chua thay du lieu dien tich de loc phong rong.",
      suggestions,
    };
  },
  room_amenities_general: (ctx) => ({
    reply:
      ctx.roomsWithAmenities.length > 0
        ? "Moi phong se co tien ich khac nhau. Minh co the loc theo may lanh, noi that, ban cong, bep, cho de xe hoac cac tien ich khac neu ban noi ro nhu cau."
        : "Hien tai du lieu tien ich cua phong con han che, ban co the mo chi tiet tung phong de xem ro hon.",
    suggestions: defaultSuggestions(ctx),
  }),
  room_amenity_aircon: (ctx) => {
    const suggestions = getRoomsByAmenity(ctx, ["may lanh", "dieu hoa", "air"]);
    return {
      reply:
        suggestions.length > 0
          ? "Minh dang loc nhung phong co nhom tien ich lien quan den may lanh hoac dieu hoa."
          : "Hien tai minh chua loc duoc phong co may lanh tu du lieu tien ich.",
      suggestions,
    };
  },
  room_amenity_furniture: (ctx) => {
    const suggestions = getRoomsByAmenity(ctx, ["noi that", "giuong", "tu", "ban"]);
    return {
      reply:
        suggestions.length > 0
          ? "Minh dang goi y nhom phong co dau hieu da co noi that co ban."
          : "Hien tai minh chua loc duoc phong noi that tu du lieu san co.",
      suggestions,
    };
  },
  room_amenity_kitchen: (ctx) => {
    const suggestions = getRoomsByAmenity(ctx, ["bep", "nau an", "kitchen"]);
    return {
      reply:
        suggestions.length > 0
          ? "Minh dang loc nhom phong co tien ich lien quan den bep hoac nau an."
          : "Hiện tại mình chưa tìm được phòng có thông tin về khu bếp.",
      suggestions,
    };
  },
  room_amenity_parking: (ctx) => {
    const suggestions = getRoomsByAmenity(ctx, ["xe", "de xe", "garage", "parking"]);
    return {
      reply:
        suggestions.length > 0
          ? "Mình đang gợi ý nhóm phòng có thông tin về chỗ để xe."
          : "Hien tai minh chua loc duoc phong co cho de xe tu du lieu hien co.",
      suggestions,
    };
  },
  room_amenity_balcony: (ctx) => {
    const suggestions = getRoomsByAmenity(ctx, ["ban cong", "balcony"]);
    return {
      reply:
        suggestions.length > 0
          ? "Mình đang lọc nhóm phòng có thông tin ban công hoặc không gian thoáng."
          : "Hien tai minh chua tim duoc phong co ban cong tu du lieu hien co.",
      suggestions,
    };
  },
  room_pet_friendly: (ctx) => ({
    reply:
      ctx.petFriendlyRooms.length > 0
        ? "Hien tai ben minh co mot so phong co dau hieu cho phep nuoi thu cung, minh dang goi y ben duoi."
        : "Hien tai minh chua thay phong nao ghi ro la cho phep nuoi thu cung.",
    suggestions: ctx.petFriendlyRooms.slice(0, 3),
  }),
  room_location_general: (ctx) => ({
    reply:
      ctx.availableRooms.length > 0
        ? "Ban cho minh ten khu vuc ban muon tim, vi chatbot co the loc theo dia diem dang co trong database phong."
        : "Hien tai minh chua thay phong trong, nen chua the loc theo khu vuc.",
    suggestions: [],
  }),
  room_location_center: (ctx) => {
    const suggestions = getRoomsByLocationKeyword(ctx, ["quan 1", "quan 3", "trung tam", "center"]);
    return {
      reply:
        suggestions.length > 0
          ? "Neu ban uu tien khu trung tam, minh dang goi y nhom phong co dia diem phu hop tu du lieu hien co."
          : "Hien tai minh chua loc duoc phong o khu trung tam.",
      suggestions,
    };
  },
  room_location_near_school: (ctx) => {
    const suggestions = getRoomsByLocationKeyword(ctx, ["truong", "dai hoc", "university", "campus"]);
    return {
      reply:
        suggestions.length > 0
          ? "Minh dang loc nhom phong co dia diem co ve gan truong hoc theo ten khu vuc dang co trong du lieu."
          : "Hien tai minh chua tim thay phong co mo ta dia diem gan truong.",
      suggestions,
    };
  },
  room_location_quiet: (ctx) => ({
    reply:
      ctx.availableRooms.length > 0
        ? "Ve nhu cau yen tinh, ban nen uu tien xem ky mo ta, dia diem va tien ich cua tung phong. Minh dang goi y 3 phong de ban so sanh truoc."
        : "Hien tai minh chua co phong trong de goi y theo nhu cau yen tinh.",
    suggestions: defaultSuggestions(ctx),
  }),
  room_for_student: (ctx) => {
    const suggestions = getRoomsByPrice(ctx, "cheap");
    return {
      reply:
        suggestions.length > 0
          ? "Neu ban la sinh vien, minh uu tien goi y nhom phong gia mem, de tiep can va de dat lich xem."
          : "Hien tai minh chua loc duoc phong phu hop cho sinh vien.",
      suggestions,
    };
  },
  room_for_couple: (ctx) => {
    const largeRooms = getRoomsByArea(ctx, "large");
    return {
      reply:
        largeRooms.length > 0
          ? "Neu ban o 2 nguoi, minh uu tien nhom phong rong hon de o thoai mai va de sap xep do dung."
          : "Hien tai minh chua loc duoc phong phu hop cho 2 nguoi.",
      suggestions: largeRooms,
    };
  },
  room_for_family: (ctx) => {
    const suggestions = getRoomsByArea(ctx, "large");
    return {
      reply:
        suggestions.length > 0
          ? "Neu ban o gia dinh nho, minh dang uu tien nhom phong co dien tich lon hon de de sap xep sinh hoat."
          : "Hien tai minh chua loc duoc phong phu hop cho gia dinh.",
      suggestions,
    };
  },
  room_for_working_people: (ctx) => {
    const suggestions = getRoomsByPrice(ctx, "mid");
    return {
      reply:
        suggestions.length > 0
          ? "Neu ban di lam, minh thuong de xuat nhom phong tam gia trung binh de can bang gia, tien nghi va vi tri."
          : "Hien tai minh chua loc duoc phong phu hop cho nguoi di lam.",
      suggestions,
    };
  },
  room_images: (ctx) => ({
    reply:
      ctx.availableRooms.length > 0
        ? "Moi phong co the co nhieu anh. Ban bam vao tung phong duoc goi y de xem gallery hinh anh thuc te."
        : "Hien tai minh chua co phong trong de minh dan ban xem hinh anh.",
    suggestions: defaultSuggestions(ctx),
  }),
  room_3d: (ctx) => ({
    reply:
      ctx.model3dRooms.length > 0
        ? `Hien tai co ${ctx.model3dRooms.length} phong da co lien ket mo hinh 3D. Minh dang uu tien goi y nhung phong nay.`
        : "Hien tai minh chua thay phong nao co du lieu 3D san sang de xem.",
    suggestions: ctx.model3dRooms.slice(0, 3),
  }),
  comparison_general: (ctx) => ({
    reply:
      ctx.availableRooms.length > 1
        ? "Ban co the chon 2-3 phong trong danh sach goi y de so sanh gia, dien tich, tien ich va vi tri. Minh dang goi y nhanh 3 phong de ban doi chieu."
        : "Hien tai minh chua co du phong de goi y so sanh.",
    suggestions: defaultSuggestions(ctx),
  }),
  viewing_booking: (ctx) => ({
    reply:
      ctx.availableRooms.length > 0
        ? "Neu ban thay phong phu hop, buoc tiep theo la dat lich xem phong. Minh dang goi y 3 phong de ban mo chi tiet va gui yeu cau xem."
        : "Ban van co the dat lich xem khi co phong phu hop, nhung hien tai minh chua thay phong trong de goi y.",
    suggestions: defaultSuggestions(ctx),
  }),
  viewing_process: () => ({
    reply:
      "Quy trình sale trên web là: xem phòng, chọn phòng phù hợp, đặt lịch xem, sau đó mới đến bước cọc hoặc thanh toán nếu bạn đồng ý thuê.",
    suggestions: [],
  }),
  closing_soft: () => ({
    reply:
      "Neu ban thay phong phu hop, minh khuyen ban dat lich xem som de giu uu tien tu van. Can minh chot nhanh theo gia, khu vuc hay tien ich thi cu noi ro them.",
    suggestions: [],
  }),
  payment_deposit: () => ({
    reply:
      "Sau khi chon duoc phong, ban co the di den buoc coc. He thong dang co luong payment type deposit de xu ly tien coc.",
    suggestions: [],
  }),
  payment_methods: () => ({
    reply:
      "Hệ thống đang khai báo các hình thức thanh toán gồm BANK_QR, MOMO, VNPAY và CASH. Tùy giao diện đang bật mà bạn sẽ thấy các lựa chọn tương ứng.",
    suggestions: [],
  }),
  payment_status: () => ({
    reply:
      "Trang thai giao dich tren he thong gom pending, success, failed va cancelled. Neu can, minh co the giai thich tiep tung buoc xu ly.",
    suggestions: [],
  }),
  contract_process: () => ({
    reply:
      "Sau khi coc hoac xac nhan thue thanh cong, he thong co the tao hop dong. Trang thai hop dong hien tai gom pending, active va ended.",
    suggestions: [],
  }),
  review_social_proof: () => ({
    reply:
      "Khach co the xem danh gia phong ngay trong trang chi tiet. Day la phan giup tang tin cay truoc khi dat lich xem hoac coc phong.",
    suggestions: [],
  }),
  contact_support: () => ({
    reply: `Nếu bạn cần sale hỗ trợ nhanh hơn, vui lòng liên hệ trực tiếp qua ${SUPPORT_LINK}.`,
    suggestions: [],
  }),
  chatbot_scope: () => ({
    reply:
      "Chatbot này đang được định hướng như một sale online: tư vấn phòng, gợi ý sản phẩm theo database, trả lời câu hỏi khách và hướng dẫn các bước xem phòng, cọc, thanh toán, hợp đồng.",
    suggestions: [],
  }),
};

const QUESTIONS_WITH_ROOMS = new Set([
  "sales_greeting",
  "sales_overview",
  "recommend_available",
  "recommend_budget_low",
  "recommend_budget_mid",
  "recommend_budget_high",
  "cheapest_room",
  "expensive_room",
  "room_price_range",
  "room_area_small",
  "room_area_large",
  "room_amenities_general",
  "room_amenity_aircon",
  "room_amenity_furniture",
  "room_amenity_kitchen",
  "room_amenity_parking",
  "room_amenity_balcony",
  "room_pet_friendly",
  "room_location_general",
  "room_location_center",
  "room_location_near_school",
  "room_location_quiet",
  "room_for_student",
  "room_for_couple",
  "room_for_family",
  "room_for_working_people",
  "room_images",
  "room_3d",
  "comparison_general",
  "viewing_booking",
]);

export const FAQ_QUESTION_BANK = [
  { question: "chao shop", intent: "sales_greeting" },
  { question: "chao sale", intent: "sales_greeting" },
  { question: "alo tu van cho toi", intent: "sales_greeting" },
  { question: "tu van phong cho toi", intent: "sales_greeting" },
  { question: "ben minh dang ban phong nao", intent: "sales_overview" },
  { question: "hien tai co nhung phong nao", intent: "sales_overview" },
  { question: "tong quan san pham ben ban", intent: "sales_overview" },
  { question: "gio ben minh co gi de xem", intent: "sales_overview" },
  { question: "goi y phong cho toi", intent: "recommend_available" },
  { question: "tu van phong dang trong", intent: "recommend_available" },
  { question: "co phong nao phu hop cho toi khong", intent: "recommend_available" },
  { question: "cho toi xem phong con trong", intent: "recommend_available" },
  { question: "toi can phong gia re", intent: "recommend_budget_low" },
  { question: "goi y phong gia mem", intent: "recommend_budget_low" },
  { question: "co phong nao tiet kiem chi phi khong", intent: "recommend_budget_low" },
  { question: "tim phong ngan sach thap", intent: "recommend_budget_low" },
  { question: "toi can phong tam gia trung binh", intent: "recommend_budget_mid" },
  { question: "goi y phong gia vua phai", intent: "recommend_budget_mid" },
  { question: "co phong nao can bang gia va chat luong khong", intent: "recommend_budget_mid" },
  { question: "tim phong o muc gia tam trung", intent: "recommend_budget_mid" },
  { question: "toi can phong xinh va xin hon", intent: "recommend_budget_high" },
  { question: "goi y phong cao cap", intent: "recommend_budget_high" },
  { question: "co phong nao gia cao hon khong", intent: "recommend_budget_high" },
  { question: "tim phong dep o muc gia cao", intent: "recommend_budget_high" },
  { question: "phong re nhat la phong nao", intent: "cheapest_room" },
  { question: "co phong nao gia thap nhat khong", intent: "cheapest_room" },
  { question: "muon xem phong gia re nhat", intent: "cheapest_room" },
  { question: "phong dat nhat la phong nao", intent: "expensive_room" },
  { question: "co phong nao cao cap nhat khong", intent: "expensive_room" },
  { question: "muon xem phong gia cao nhat", intent: "expensive_room" },
  { question: "gia phong ben minh khoang bao nhieu", intent: "room_price_range" },
  { question: "gia phong dao dong the nao", intent: "room_price_range" },
  { question: "muc gia san pham tren web", intent: "room_price_range" },
  { question: "phong o day gia tu bao nhieu", intent: "room_price_range" },
  { question: "co phong nho gon khong", intent: "room_area_small" },
  { question: "toi can phong dien tich nho", intent: "room_area_small" },
  { question: "goi y phong cho o mot minh", intent: "room_area_small" },
  { question: "co phong rong khong", intent: "room_area_large" },
  { question: "toi can phong dien tich lon", intent: "room_area_large" },
  { question: "goi y phong rong de o 2 nguoi", intent: "room_area_large" },
  { question: "phong co nhung tien ich gi", intent: "room_amenities_general" },
  { question: "tu van tien ich phong", intent: "room_amenities_general" },
  { question: "phong co day du tien nghi khong", intent: "room_amenities_general" },
  { question: "co phong nao co may lanh khong", intent: "room_amenity_aircon" },
  { question: "tim phong co dieu hoa", intent: "room_amenity_aircon" },
  { question: "goi y phong co air", intent: "room_amenity_aircon" },
  { question: "co phong nao co noi that khong", intent: "room_amenity_furniture" },
  { question: "tim phong full noi that", intent: "room_amenity_furniture" },
  { question: "goi y phong da co giuong tu ban", intent: "room_amenity_furniture" },
  { question: "co phong nao co bep khong", intent: "room_amenity_kitchen" },
  { question: "tim phong co khu nau an", intent: "room_amenity_kitchen" },
  { question: "goi y phong co bep", intent: "room_amenity_kitchen" },
  { question: "co phong nao co cho de xe khong", intent: "room_amenity_parking" },
  { question: "tim phong co bai xe", intent: "room_amenity_parking" },
  { question: "goi y phong co cho gui xe", intent: "room_amenity_parking" },
  { question: "co phong nao co ban cong khong", intent: "room_amenity_balcony" },
  { question: "tim phong co balcony", intent: "room_amenity_balcony" },
  { question: "goi y phong thoang co ban cong", intent: "room_amenity_balcony" },
  { question: "co cho nuoi thu cung khong", intent: "room_pet_friendly" },
  { question: "tim phong cho phep nuoi pet", intent: "room_pet_friendly" },
  { question: "goi y phong cho nuoi meo cho", intent: "room_pet_friendly" },
  { question: "ban co phong o khu nao", intent: "room_location_general" },
  { question: "co the tim theo dia diem khong", intent: "room_location_general" },
  { question: "toi muon loc phong theo khu vuc", intent: "room_location_general" },
  { question: "tim phong theo location nhu the nao", intent: "room_location_general" },
  { question: "co phong khu trung tam khong", intent: "room_location_center" },
  { question: "tim phong gan quan 1 quan 3", intent: "room_location_center" },
  { question: "goi y phong o trung tam", intent: "room_location_center" },
  { question: "co phong gan truong khong", intent: "room_location_near_school" },
  { question: "tim phong gan dai hoc", intent: "room_location_near_school" },
  { question: "goi y phong cho sinh vien o gan truong", intent: "room_location_near_school" },
  { question: "toi la sinh vien can phong", intent: "room_for_student" },
  { question: "goi y phong cho sinh vien", intent: "room_for_student" },
  { question: "co phong nao hop voi sinh vien khong", intent: "room_for_student" },
  { question: "toi o 2 nguoi thi nen chon phong nao", intent: "room_for_couple" },
  { question: "goi y phong cho cap doi", intent: "room_for_couple" },
  { question: "co phong nao hop cho 2 nguoi khong", intent: "room_for_couple" },
  { question: "goi y phong cho gia dinh nho", intent: "room_for_family" },
  { question: "co phong nao hop cho gia dinh khong", intent: "room_for_family" },
  { question: "tim phong cho nha co con nho", intent: "room_for_family" },
  { question: "cho toi xem hinh anh phong", intent: "room_images" },
  { question: "phong co anh that khong", intent: "room_images" },
  { question: "muon xem gallery phong", intent: "room_images" },
  { question: "co phong 3d khong", intent: "room_3d" },
  { question: "xem mo hinh 3d phong", intent: "room_3d" },
  { question: "co san pham nao co 3d khong", intent: "room_3d" },
  { question: "neu thay hop thi dat lich xem sao", intent: "viewing_booking" },
  { question: "muon hen xem phong", intent: "viewing_booking" },
  { question: "lam sao dat lich xem sau khi tu van", intent: "viewing_booking" },
  { question: "chon duoc phong roi thi buoc tiep theo la gi", intent: "viewing_booking" },
  { question: "dat coc phong nhu the nao", intent: "payment_deposit" },
  { question: "chot phong roi thi coc ra sao", intent: "payment_deposit" },
  { question: "sau khi coc thi hop dong nhu the nao", intent: "contract_process" },
  { question: "quy trinh hop dong tren web ra sao", intent: "contract_process" },
  { question: "sau khi coc co hop dong khong", intent: "contract_process" },
  { question: "co the xem review de them tin khong", intent: "review_social_proof" },
  { question: "can lien he sale o dau", intent: "contact_support" },
  { question: "cho toi kenh lien he tu van nhanh", intent: "contact_support" },
  { question: "sale se ho tro toi o dau", intent: "contact_support" },
  { question: "chatbot co tu van dua tren database khong", intent: "chatbot_scope" },
];

const getSimilarityScore = (normalizedQuery, normalizedFaq) => {
  if (!normalizedQuery || !normalizedFaq) {
    return 0;
  }

  if (normalizedQuery === normalizedFaq) {
    return 1;
  }

  if (
    (normalizedQuery.includes(normalizedFaq) || normalizedFaq.includes(normalizedQuery)) &&
    Math.min(normalizedQuery.length, normalizedFaq.length) >= 10
  ) {
    return 0.97;
  }

  const queryTokens = new Set(tokenize(normalizedQuery));
  const faqTokens = new Set(tokenize(normalizedFaq));
  const commonCount = [...faqTokens].filter((token) => queryTokens.has(token)).length;

  if (commonCount === 0) {
    return 0;
  }

  const faqCoverage = commonCount / faqTokens.size;
  const queryCoverage = commonCount / queryTokens.size;
  const bonus = commonCount >= 3 ? 0.08 : 0;

  return faqCoverage * 0.7 + queryCoverage * 0.3 + bonus;
};

export const findFaqReply = ({ query, rooms = [] }) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return null;
  }

  let bestMatch = null;

  for (const item of FAQ_QUESTION_BANK) {
    const score = getSimilarityScore(normalizedQuery, normalizeText(item.question));
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { ...item, score };
    }
  }

  if (!bestMatch || bestMatch.score < 0.72) {
    return null;
  }

  const handler = FAQ_INTENT_HANDLERS[bestMatch.intent];
  if (!handler) {
    return null;
  }

  const ctx = QUESTIONS_WITH_ROOMS.has(bestMatch.intent) ? buildRoomContext(rooms) : buildRoomContext([]);
  const result = handler(ctx);

  return {
    ...result,
    matchedQuestion: bestMatch.question,
    matchedIntent: bestMatch.intent,
  };
};
