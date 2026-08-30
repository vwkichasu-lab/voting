import mongoose from 'mongoose';

const ballotSchema = new mongoose.Schema({
  election_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['IN_PROGRESS', 'SUBMITTED', 'CANCELLED'], default: 'IN_PROGRESS' },
  created_at: { type: Date, default: Date.now },
  submitted_at: Date,
  updated_at: { type: Date, default: Date.now }
});

export const Ballot = mongoose.model('Ballot', ballotSchema);
