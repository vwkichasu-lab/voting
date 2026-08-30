import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['VOTING_OPEN', 'VOTING_CLOSED', 'PAUSED', 'ARCHIVED'], default: 'VOTING_CLOSED' },
  start_at: Date,
  end_at: Date,
  paused_at: Date,
  pause_reason: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Election = mongoose.model('Election', electionSchema);
