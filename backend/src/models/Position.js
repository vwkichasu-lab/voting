import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  election_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  name: { type: String, required: true },
  description: String,
  display_order: Number,
  is_required: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Position = mongoose.model('Position', positionSchema);
