import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  election_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  position_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  name: { type: String, required: true },
  intake: { type: String, enum: ['January', 'September'], required: true },
  manifesto: String,
  photo_path: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'WITHDRAWN'], default: 'ACTIVE' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
