import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  session_id: { type: String, required: true, unique: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  ip_address: String,
  user_agent: String,
  expires_at: Date,
  created_at: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);
