import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  intake: { type: String, enum: ['January', 'September'], required: true },
  programme: { type: String, required: true },
  contact: { type: String },
  eligible: { type: String, enum: ['YES', 'NO'], default: 'YES' },
  has_voted: { type: Boolean, default: false },
  voted_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Student = mongoose.model('Student', studentSchema);
