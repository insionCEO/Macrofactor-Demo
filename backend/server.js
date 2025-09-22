import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Exercise from './models/Exercise.js';
import axios from 'axios';
import path from 'path';

dotenv.config({path: path.resolve('backend', '.env')});

const app = express();
const PORT = process.env.PORT
const JWT_SECRET = process.env.JWT_SECRET
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


// ✅ MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fittoDB', {
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(bodyParser.json());

// ✅ Middleware to Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// ✅ Test API Route
app.get('/', (req, res) => {
  res.send('Fitness API is running');
});

// ✅ Registration Route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isSetupComplete: false
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const token = jwt.sign({
      id: user._id,
      username: user.username,
      isSetupComplete: user.isSetupComplete
    }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ User Setup Completion
app.put('/api/user/setup-complete', verifyToken, async (req, res) => {
  try {
    const { age, height, weight, gender, activityLevel, goal, rate } = req.body;
    const userId = req.user.id;

    if (!age || !height || !weight || !gender || !activityLevel || (goal !== 'maintain' && !rate)) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const s = gender === 'male' ? 5 : -161;
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + s;

    const activityMultiplier = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    let tdee = bmr * activityMultiplier[activityLevel];

    // ✅ Adjust TDEE based on goal and rate
    if (goal === 'lose') {
      tdee -= (tdee * (rate / 100)); // Reduce for fat loss
    } else if (goal === 'gain') {
      tdee += (tdee * (rate / 100)); // Increase for weight gain
    }

    await User.findByIdAndUpdate(userId, {
      isSetupComplete: true,
      age,
      height,
      weight,
      gender,
      activityLevel,
      goal,
      rate,
      bmr,
      tdee
    });

    res.status(200).json({ message: 'Setup completed', bmr, tdee });
  } catch (error) {
    console.error('Setup Error:', error);
    res.status(500).json({ message: 'Error updating setup status' });
  }
});



// ✅ Get User Profile
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const macros = {
      carbs: Math.round((user.tdee * 0.5) / 4),
      protein: Math.round((user.tdee * 0.3) / 4),
      fat: Math.round((user.tdee * 0.2) / 9)
    };

    res.status(200).json({
      id: user._id,
      username: user.username,
      tdee: user.tdee,
      bmr: user.bmr,
      macros,
      weight: user.weight, // ✅ Include weight
      goal: user.goal,  // ✅ Include goal
      rate: user.rate,   // ✅ Include rate
      targetWeight: user.targetWeight // ✅ Include target weight
    });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ Fetch Weight Log
app.get('/api/user/weight-log', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ weightLog: user.weightLog });
  } catch (error) {
    console.error('Weight Log Fetch Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ Add New Weight Entry
app.post('/api/user/weight-log', verifyToken, async (req, res) => {
  try {
    const { weight } = req.body;
    if (!weight) return res.status(400).json({ message: 'Weight is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Add new weight entry to the weight log
    user.weightLog.push({ weight });

    // ✅ Update the user's current weight in the user schema
    user.weight = weight;

    await user.save();

    res.status(201).json({
      message: 'Weight logged and profile updated successfully',
      weightLog: user.weightLog,
      currentWeight: user.weight
    });
  } catch (error) {
    console.error('Weight Log Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ✅ DELETE Weight Entry
app.delete('/api/user/weight-log/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.weightLog = user.weightLog.filter(entry => entry._id.toString() !== req.params.id);
    await user.save();

    res.status(200).json({ message: 'Weight entry deleted', weightLog: user.weightLog });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ EDIT Weight Entry with Current Weight Update
app.put('/api/user/weight-log/:id', verifyToken, async (req, res) => {
  const { weight } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const weightEntry = user.weightLog.id(req.params.id);
    if (!weightEntry) return res.status(404).json({ message: 'Weight entry not found' });

    // ✅ Update the specific weight entry
    weightEntry.weight = weight;

    // ✅ Check if it's the last logged weight
    const isLastEntry = user.weightLog[user.weightLog.length - 1]._id.toString() === req.params.id;

    if (isLastEntry) {
      user.weight = weight; // ✅ Update current weight in User schema
    }

    await user.save();

    res.status(200).json({
      message: 'Weight entry updated',
      weightLog: user.weightLog,
      currentWeight: user.weight // ✅ Return updated current weight
    });
  } catch (error) {
    console.error('Edit Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ✅ Set or Update Target Weight
app.put('/api/user/target-weight', verifyToken, async (req, res) => {
  const { targetWeight } = req.body;

  if (!targetWeight) return res.status(400).json({ message: 'Target weight is required.' });

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { targetWeight }, { new: true });
    res.status(200).json({ message: 'Target weight updated', targetWeight: user.targetWeight });
  } catch (error) {
    console.error('Target Weight Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ Get Target Weight
app.get('/api/user/target-weight', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ targetWeight: user.targetWeight });
  } catch (error) {
    console.error('Get Target Weight Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ GET: Fetch Food Log
app.get('/api/user/food-log', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Get date from query or use today's date
    const queryDate = req.query.date ? new Date(req.query.date) : new Date();
    const selectedDate = queryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const filteredFoodLog = {};

    Object.keys(user.foodLog).forEach(meal => {
      filteredFoodLog[meal] = user.foodLog[meal].filter(entry => {
        if (!entry.date) return false;

        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === selectedDate;
      });
    });

    res.status(200).json({ foodLog: filteredFoodLog });
  } catch (error) {
    console.error('Error fetching food log:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});




// ✅ POST: Add Food to Log
app.post('/api/user/food-log', verifyToken, async (req, res) => {
  const { meal, name, calories, carbs, protein, fat } = req.body;

  if (!meal || !name || calories === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const foodEntry = {
      _id: new mongoose.Types.ObjectId(),
      name,
      calories,
      carbs,
      protein,
      fat,
      date: new Date()
    };

    user.foodLog[meal].push(foodEntry);
    await user.save();

    res.status(201).json({ message: 'Food added', foodLog: user.foodLog });
  } catch (error) {
    console.error('Error adding food:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ DELETE: Remove Food Entry
app.delete('/api/user/food-log/:meal/:foodId', verifyToken, async (req, res) => {
  const { meal, foodId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.foodLog[meal] = user.foodLog[meal].filter(food => food._id.toString() !== foodId);
    await user.save();

    res.status(200).json({ message: 'Food deleted', foodLog: user.foodLog });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ Get all exercises for a specific user
app.get('/api/exercise-log/user/:userId', verifyToken, async (req, res) => {
  try {
    // ✅ Ensure valid MongoDB ObjectId comparison
    if (!mongoose.Types.ObjectId.isValid(req.params.userId) || 
        req.user.id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const exercises = await Exercise.find({ userId: req.params.userId });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercise log', error });
  }
});

// ✅ Add a new exercise
app.post('/api/exercise-log', verifyToken, async (req, res) => {
  const { exerciseName, duration, caloriesBurned, MET } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Calculate calories burned if not provided
    const userWeightKg = user.weight;
    const finalCaloriesBurned = caloriesBurned || (MET * userWeightKg * (duration / 60));

    // ✅ Create a new exercise log entry
    const newExercise = new Exercise({
      userId: req.user.id,
      exerciseName,
      duration,
      caloriesBurned: finalCaloriesBurned,
      MET
    });

    const savedExercise = await newExercise.save();

    await user.save();

    res.status(201).json({
      message: 'Exercise logged and TDEE updated',
      savedExercise,
      updatedTDEE: user.tdee  // ✅ Send updated TDEE to frontend
    });
  } catch (error) {
    console.error('Error saving exercise:', error);
    res.status(500).json({ message: 'Error saving exercise', error });
  }
});


// ✅ Delete an exercise by ID
app.delete('/api/exercise-log/:id', verifyToken, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    if (exercise.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Exercise.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Exercise deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exercise', error });
  }
});

// ✅ (Optional) Update an exercise
app.put('/api/exercise-log/:id',verifyToken, async (req, res) => {
  const { exerciseName, duration, caloriesBurned } = req.body;

  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { exerciseName, duration, caloriesBurned },
      { new: true }
    );
    res.status(200).json(updatedExercise);
  } catch (error) {
    res.status(500).json({ message: 'Error updating exercise', error });
  }
});

//Expert System summary (Simple AI)
app.get('/api/user/dashboard-summary', verifyToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Fetch today's food log (you already have this logic)
      const today = new Date().toISOString().split('T')[0];
      const foodLog = user.foodLog;
      let totalCalories = 0;

      Object.values(foodLog).forEach(meal => {
          meal.forEach(food => {
              const entryDate = new Date(food.date).toISOString().split('T')[0];
              if (entryDate === today) {
                  totalCalories += food.calories;
              }
          });
      });

      // Fetch last 14 days of weight log
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const recentWeights = user.weightLog.filter(entry => entry.date >= fourteenDaysAgo);

      const alerts = [];

      // Rule 1: Under-eating (less than 70% of TDEE for 3 days straight)
      const calorieHistory = [];
      for (let i = 0; i < 3; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const dateString = checkDate.toISOString().split('T')[0];

          let dailyCalories = 0;
          Object.values(foodLog).forEach(meal => {
              meal.forEach(food => {
                  const entryDate = new Date(food.date).toISOString().split('T')[0];
                  if (entryDate === dateString) {
                      dailyCalories += food.calories;
                  }
              });
          });

          calorieHistory.push(dailyCalories);
      }

      if (calorieHistory.every(cals => cals < user.tdee * 0.7)) {
          alerts.push("You might be under-eating. Consider reviewing your meal plan.");
      }

      // Rule 2: Weight Plateau (14 days no change)
      if (recentWeights.length >= 2) {
          const firstWeight = recentWeights[0].weight;
          const lastWeight = recentWeights[recentWeights.length - 1].weight;

          if (Math.abs(firstWeight - lastWeight) < 0.5) {
              alerts.push("You may have hit a plateau. Consider adjusting your workout or calorie intake.");
          }
      }

      // Rule 3: Exercise Balance (Check if 80%+ is cardio)
      const exercises = await Exercise.find({ userId: req.user.id, date: { $gte: fourteenDaysAgo } });

      const cardioExercises = exercises.filter(ex => {
          const lower = ex.exerciseName.toLowerCase();
          return lower.includes('run') || lower.includes('jog') || lower.includes('bike') || lower.includes('swim');
      });

      if (exercises.length > 0 && (cardioExercises.length / exercises.length) > 0.8) {
          alerts.push("Great work on cardio! Adding some strength training could improve muscle tone and metabolism.");
      }

      res.status(200).json({ alerts });
  } catch (error) {
      console.error('Dashboard Summary Error:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// GEMINI ROUTE
app.post('/api/ai-recommendation', verifyToken, async (req, res) => {
  const { userGoal, userMacros, question } = req.body;
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
      You are a fitness and nutrition expert. The user is trying to ${userGoal} weight.
      Their target macros per day are:
      - Protein: ${userMacros.protein}g
      - Carbs: ${userMacros.carbs}g
      - Fat: ${userMacros.fat}g

      Here’s their question: ${question}

      Please give a clear, short recommendation (max 2 sentences).
  `;

  try {
      const response = await axios.post(geminiUrl, {
          contents: [{ parts: [{ text: prompt }] }]
      });

      const aiMessage = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      res.json({ message: aiMessage });

  } catch (error) {
      console.error("❌ Error calling Gemini API:", error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to fetch AI recommendation' });
  }
});





app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
