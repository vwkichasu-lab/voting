import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  event_type: { type: String, required: true },
  admin_id: mongoose.Schema.Types.ObjectId,
  entity_type: String,
  entity_id: String,
  changes: mongoose.Schema.Types.Mixed,
  ip_address: String,
  created_at: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
