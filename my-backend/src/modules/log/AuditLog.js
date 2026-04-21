import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // can be null if action done by unauthenticated user but we mostly care about admins
  },
  action: {
    type: String,
    required: true, // e.g., "POST", "PUT", "DELETE"
  },
  resource: {
    type: String,
    required: true, // e.g., "/api/rooms/123"
  },
  details: {
    type: Object, // The req.body payload
    default: {}
  },
  ip_address: {
    type: String,
  }
}, {
  timestamps: true // adds createdAt, updatedAt
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
