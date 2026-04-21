import AuditLog from "../modules/log/AuditLog.js";

export const auditLogger = async (req, res, next) => {
  res.on("finish", async () => {
    try {
      // Only log POST, PUT, DELETE, PATCH requests
      if (!["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) return;

      // Only log successful requests
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      // Exclude auth routes if needed to prevent logging passwords
      if (req.originalUrl.includes("/api/auth")) return;

      // Extract details, stripping out sensitive large fields if necessary
      const details = { ...req.body };
      if (details.password) delete details.password;
      if (details.newPassword) delete details.newPassword;

      await AuditLog.create({
        user_id: req.user ? req.user._id : null,
        action: req.method,
        resource: req.originalUrl,
        details: details,
        ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
      });
    } catch (error) {
      console.error("Audit log error:", error);
    }
  });

  next();
};
