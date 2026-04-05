import ViewingRequest from "./ViewingRequest.js";

export const getAllViewingRequests = async (req, res, next) => {
  try {
    const requests = await ViewingRequest.find()
      .sort({ createdAt: -1 })
      .populate("user_id", "full_name email phone")
      .populate("room_id", "name location price");

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const getViewingRequestsByRoom = async (req, res, next) => {
  try {
    const requests = await ViewingRequest.find({ room_id: req.params.roomId })
      .sort({ scheduled_at: 1 })
      .populate("user_id", "full_name email phone");

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const createViewingRequest = async (req, res, next) => {
  try {
    const { room_id, full_name, phone, note, scheduled_at } = req.body;

    if (!room_id || !full_name || !phone || !scheduled_at) {
      return res.status(400).json({ message: "Thiếu thông tin đặt lịch xem phòng" });
    }

    const viewingRequest = await ViewingRequest.create({
      user_id: req.user?.id || null,
      room_id,
      full_name,
      phone,
      note,
      scheduled_at,
    });

    res.status(201).json(viewingRequest);
  } catch (error) {
    next(error);
  }
};
