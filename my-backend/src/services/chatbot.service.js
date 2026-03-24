import Contract from "../models/Contract.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Room from "../models/Room.js";
import SavedRoom from "../models/SavedRoom.js";
import User from "../models/User.js";
import ViewingRequest from "../models/ViewingRequest.js";

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const currency = (value = 0) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDateTime = (value) => {
  if (!value) return "đang cập nhật";
  return new Date(value).toLocaleString("vi-VN");
};

const matchesAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const extractBudget = (text) => {
  const compact = text.replace(/\s+/g, "");
  const trieuMatch = compact.match(/(\d+(?:[.,]\d+)?)\s*(tr|trieu|triệu|m)/i);

  if (trieuMatch) {
    return Math.round(Number(trieuMatch[1].replace(",", ".")) * 1000000);
  }

  const numberMatch = compact.match(/(\d{6,9})/);
  if (numberMatch) {
    return Number(numberMatch[1]);
  }

  return null;
};

const buildRoomLine = (room) =>
  `${room.name} tại ${room.location}, giá ${currency(room.price)}/tháng, trạng thái ${room.status}.`;

const findRoomsByQuery = (rooms, normalizedQuery) => {
  const knownLocations = [...new Set(rooms.map((room) => room.location).filter(Boolean))];
  const matchedLocation = knownLocations.find((location) => {
    const normalizedLocation = normalizeText(location);
    return normalizedLocation.includes(normalizedQuery) || normalizedQuery.includes(normalizedLocation);
  });
  const budget = extractBudget(normalizedQuery);

  let results = rooms;

  if (matchedLocation) {
    results = results.filter((room) => normalizeText(room.location).includes(normalizeText(matchedLocation)));
  }

  if (matchesAny(normalizedQuery, ["con phong", "trong", "available"])) {
    results = results.filter((room) => room.status === "available");
  }

  if (matchesAny(normalizedQuery, ["da coc", "giu cho", "reserved"])) {
    results = results.filter((room) => room.status === "reserved");
  }

  if (matchesAny(normalizedQuery, ["het phong", "da thue", "rented"])) {
    results = results.filter((room) => room.status === "rented");
  }

  if (budget) {
    if (matchesAny(normalizedQuery, ["duoi", "toi da", "khong qua", "<"])) {
      results = results.filter((room) => Number(room.price || 0) <= budget);
    } else if (matchesAny(normalizedQuery, ["tren", "tu", ">"])) {
      results = results.filter((room) => Number(room.price || 0) >= budget);
    } else {
      results = results.filter((room) => Math.abs(Number(room.price || 0) - budget) <= 1000000);
    }
  }

  const amenityTerms = normalizedQuery
    .split(/[^a-z0-9]+/i)
    .filter((term) => term.length >= 3);

  if (amenityTerms.length > 0) {
    const amenityMatched = results.filter((room) => {
      const haystack = normalizeText(
        [
          room.name,
          room.location,
          room.description,
          room.pet_policy,
          room.specs?.layout,
          ...(room.amenities || []),
        ]
          .filter(Boolean)
          .join(" ")
      );

      return amenityTerms.some((term) => haystack.includes(term));
    });

    if (amenityMatched.length > 0) {
      results = amenityMatched;
    }
  }

  return results;
};

const buildReviewRanking = (reviews) => {
  const grouped = new Map();

  reviews.forEach((review) => {
    const roomId = review.room_id?._id?.toString();
    if (!roomId) return;

    if (!grouped.has(roomId)) {
      grouped.set(roomId, {
        room: review.room_id,
        total: 0,
        count: 0,
      });
    }

    const entry = grouped.get(roomId);
    entry.total += Number(review.rating || 0);
    entry.count += 1;
  });

  return [...grouped.values()].map((item) => ({
    ...item,
    average: item.count ? item.total / item.count : 0,
  }));
};

export const chatbotReply = async (text) => {
  const query = (text || "").trim();

  if (!query) {
    return {
      reply: "Bạn hãy nhập câu hỏi cụ thể về phòng, giá, lịch xem, đánh giá, thanh toán hoặc hợp đồng để mình hỗ trợ nhé.",
      suggestions: [],
    };
  }

  const normalizedQuery = normalizeText(query);

  const [rooms, reviews, payments, viewings, users, contracts, savedRooms] = await Promise.all([
    Room.find().lean(),
    Review.find({ status: "approved" }).populate("room_id", "name location").populate("user_id", "full_name").lean(),
    Payment.find().populate("room_id", "name location").lean(),
    ViewingRequest.find().populate("room_id", "name location").populate("user_id", "full_name email phone").lean(),
    User.find().select("-password").lean(),
    Contract.find().populate("room_id", "name location").populate("user_id", "full_name email").lean(),
    SavedRoom.find().lean(),
  ]);

  const availableRooms = rooms.filter((room) => room.status === "available");
  const reservedRooms = rooms.filter((room) => room.status === "reserved");
  const rentedRooms = rooms.filter((room) => room.status === "rented");
  const successPayments = payments.filter((payment) => payment.status === "success");
  const pendingViewings = viewings.filter((item) => item.status === "pending");
  const activeContracts = contracts.filter((contract) => contract.status === "active");
  const customerCount = users.filter((user) => user.role === "customer").length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  if (matchesAny(normalizedQuery, ["tong quan", "tong so", "database", "du lieu he thong", "he thong co gi"])) {
    return {
      reply: [
        `Hiện tại có ${rooms.length} phòng, trong đó ${availableRooms.length} phòng còn trống, ${reservedRooms.length} phòng đã được cọc và ${rentedRooms.length} phòng đã cho thuê.`,
        `Có ${customerCount} khách hàng, ${adminCount} admin, ${viewings.length} lịch xem phòng, ${contracts.length} hợp đồng, ${payments.length} giao dịch thanh toán và ${reviews.length} đánh giá đã duyệt.`,
        'Bạn có thể hỏi sâu hơn như "phòng còn trống ở Hòa Lạc", "phòng dưới 4 triệu", "phòng có đánh giá nhiều nhất", "có bao nhiêu lịch xem đang chờ".',
      ].join(" "),
      suggestions: availableRooms.slice(0, 3),
    };
  }

  if (matchesAny(normalizedQuery, ["danh gia", "review", "sao", "tot nhat", "nhieu nhat"])) {
    if (reviews.length === 0) {
      return {
        reply: "Hiện chưa có đánh giá nào được duyệt nên mình chưa thể tổng hợp chất lượng phòng.",
        suggestions: [],
      };
    }

    const reviewRanking = buildReviewRanking(reviews);
    const askMostReviewed = matchesAny(normalizedQuery, [
      "nhieu nhat",
      "nhiều nhất",
      "nhieu review",
      "nhiều review",
      "nhieu danh gia",
      "nhiều đánh giá",
    ]);
    const ranked = [...reviewRanking].sort((a, b) =>
      askMostReviewed ? b.count - a.count || b.average - a.average : b.average - a.average || b.count - a.count
    );
    const topRanked = ranked.slice(0, 3);

    return {
      reply: askMostReviewed
        ? `Những phòng đang nhận được nhiều đánh giá nhất là ${topRanked
            .map((item) => `${item.room.name} (${item.count} đánh giá, điểm trung bình ${item.average.toFixed(1)}/5)`)
            .join(", ")}.`
        : `Những phòng nổi bật nhất theo đánh giá hiện tại là ${topRanked
            .map((item) => `${item.room.name} (${item.average.toFixed(1)}/5 từ ${item.count} đánh giá)`)
            .join(", ")}.`,
      suggestions: topRanked
        .map((item) => rooms.find((room) => room._id.toString() === item.room._id.toString()))
        .filter(Boolean),
    };
  }

  if (matchesAny(normalizedQuery, ["lich xem", "dat lich", "xem phong", "hen xem"])) {
    if (viewings.length === 0) {
      return {
        reply: "Hiện chưa có lịch đặt xem phòng nào.",
        suggestions: [],
      };
    }

    const nearestViewing = [...viewings]
      .filter((item) => item.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

    return {
      reply: [
        `Hiện có ${viewings.length} lịch xem phòng, trong đó ${pendingViewings.length} lịch đang chờ xác nhận.`,
        nearestViewing
          ? `Lịch gần nhất là ${nearestViewing.room_id?.name || "một phòng"} vào ${formatDateTime(nearestViewing.scheduled_at)} cho khách ${nearestViewing.full_name || nearestViewing.user_id?.full_name || "đang cập nhật"}.`
          : "",
      ]
        .join(" ")
        .trim(),
      suggestions: nearestViewing?.room_id
        ? rooms.filter((room) => room._id.toString() === nearestViewing.room_id._id.toString()).slice(0, 1)
        : [],
    };
  }

  if (matchesAny(normalizedQuery, ["thanh toan", "chuyen khoan", "giao dich", "doanh thu", "payment"])) {
    const totalRevenue = successPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const pendingPayments = payments.filter((payment) => payment.status === "pending").length;

    return {
      reply: `Hiện có ${payments.length} giao dịch thanh toán. Trong đó ${successPayments.length} giao dịch thành công với tổng số tiền ${currency(totalRevenue)}, và ${pendingPayments} giao dịch vẫn đang chờ thanh toán.`,
      suggestions: successPayments
        .map((payment) => rooms.find((room) => room._id.toString() === payment.room_id?._id?.toString()))
        .filter(Boolean)
        .slice(0, 3),
    };
  }

  if (matchesAny(normalizedQuery, ["hop dong", "contract", "thue phong"])) {
    const pendingContracts = contracts.filter((contract) => contract.status === "pending").length;
    const expiredContracts = contracts.filter((contract) => contract.status === "expired").length;

    return {
      reply: `Hiện có ${contracts.length} hợp đồng, gồm ${activeContracts.length} hợp đồng đang hiệu lực, ${pendingContracts} hợp đồng chờ xử lý và ${expiredContracts} hợp đồng đã hết hạn.`,
      suggestions: activeContracts
        .map((contract) => rooms.find((room) => room._id.toString() === contract.room_id?._id?.toString()))
        .filter(Boolean)
        .slice(0, 3),
    };
  }

  if (matchesAny(normalizedQuery, ["nguoi dung", "khach hang", "user", "admin"])) {
    return {
      reply: `Hiện có ${users.length} người dùng, gồm ${customerCount} khách hàng và ${adminCount} quản trị viên. Ngoài ra khách hàng đang lưu tổng cộng ${savedRooms.length} lượt phòng yêu thích.`,
      suggestions: availableRooms.slice(0, 2),
    };
  }

  if (matchesAny(normalizedQuery, ["gia", "bao nhieu", "duoi", "tren", "re", "cao cap", "phong nao", "goi y", "tim phong", "tan xa", "hoa lac", "tien nghi", "thu cung", "con phong", "het phong"])) {
    const matchedRooms = findRoomsByQuery(rooms, normalizedQuery);

    if (matchedRooms.length === 0) {
      return {
        reply: "Mình chưa tìm thấy phòng nào khớp đúng câu hỏi này trong dữ liệu hiện tại. Bạn thử nói rõ hơn khu vực, mức giá hoặc tiện nghi bạn cần nhé.",
        suggestions: availableRooms.slice(0, 3),
      };
    }

    const topRooms = matchedRooms.slice(0, 3);
    const replyPrefix =
      matchedRooms.length === 1
        ? "Mình tìm được 1 phòng khớp với yêu cầu của bạn:"
        : `Mình tìm được ${matchedRooms.length} phòng khá phù hợp. Nổi bật có:`;

    return {
      reply: `${replyPrefix} ${topRooms.map(buildRoomLine).join(" ")}`,
      suggestions: topRooms,
    };
  }

  return {
    reply: [
      "Mình đã tổng hợp thông tin hiện có nhưng câu hỏi này còn hơi rộng.",
      `Hiện có ${rooms.length} phòng, ${reviews.length} đánh giá, ${viewings.length} lịch xem, ${payments.length} thanh toán và ${contracts.length} hợp đồng.`,
      "Bạn có thể hỏi cụ thể hơn theo kiểu: phòng còn trống, mức giá, khu vực, đánh giá, lịch xem, thanh toán hoặc hợp đồng.",
    ].join(" "),
    suggestions: availableRooms.slice(0, 3),
  };
};
