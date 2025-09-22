import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseName: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  caloriesBurned: { type: Number, required: true },
  MET: { type: Number }, // ✅ Add MET fallback
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Exercise', exerciseSchema);
