import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSetupComplete: { type: Boolean, default: false },

  // Setup Wizard Data
  age: { type: Number, default: null },
  height: { type: Number, default: null },
  weight: { type: Number, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'], default: null },
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
    default: 'sedentary'
  },
  goal: { type: String, enum: ['lose', 'maintain', 'gain'], default: 'maintain' },
  rate: { type: Number, default: null },
  targetWeight: { type: Number, default: null },

  bmr: { type: Number, default: null },
  tdee: { type: Number, default: null },

  // Weightlog feature
  weightLog: [{
    date: { type: Date, default: Date.now },
    weight: { type: Number, required: true }
  }],

  // ✅ Add date to each food log entry
  foodLog: {
    breakfast: [{ 
      _id: mongoose.Schema.Types.ObjectId, 
      name: String, 
      calories: Number, 
      carbs: Number, 
      protein: Number, 
      fat: Number,
      date: { type: Date, default: Date.now } // ✅ Added date field
    }],
    lunch: [{ 
      _id: mongoose.Schema.Types.ObjectId, 
      name: String, 
      calories: Number, 
      carbs: Number, 
      protein: Number, 
      fat: Number,
      date: { type: Date, default: Date.now } // ✅ Added date field
    }],
    dinner: [{ 
      _id: mongoose.Schema.Types.ObjectId, 
      name: String, 
      calories: Number, 
      carbs: Number, 
      protein: Number, 
      fat: Number,
      date: { type: Date, default: Date.now } // ✅ Added date field
    }],
    snacks: [{ 
      _id: mongoose.Schema.Types.ObjectId, 
      name: String, 
      calories: Number, 
      carbs: Number, 
      protein: Number, 
      fat: Number,
      date: { type: Date, default: Date.now } // ✅ Added date field
    }]
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
