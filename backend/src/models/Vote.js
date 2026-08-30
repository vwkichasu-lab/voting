import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  ballot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ballot', required: true },
  position_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  created_at: { type: Date, default: Date.now }
});

export const Vote = mongoose.model('Vote', voteSchema);
