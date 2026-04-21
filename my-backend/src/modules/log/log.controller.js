import AuditLog from "./AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const logs = await AuditLog.find()
      .populate("user_id", "full_name email role avatar")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Không thể lấy danh sách nhật ký" });
  }
};
