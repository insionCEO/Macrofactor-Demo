import { useState, useEffect } from 'react';
import nlp from 'compromise';

const NINJAS_API_KEY = import.meta.env.VITE_REACT_APP_NINJAS_API_KEY;

const MET_VALUES = {
  running: 9.8,
  cycling: 7.5,
  walking: 3.8,
  basketball: 8.0,
  "stair machine": 8.8,
  weightlifting: 5.0,
  swimming: 6.0,
  yoga: 3.0,
  cooking: 1.2
};

const ExerciseSearch = ({ onAddExercise }) => {
  const [input, setInput] = useState('');
  const [duration, setDuration] = useState(''); // Default duration
  const [searchResult, setSearchResult] = useState(null);
  const [userWeight, setUserWeight] = useState(70); // Default weight

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'Authorization': token }
        });
        if (response.ok) {
          const data = await response.json();
          setUserWeight(data.weight || 70);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSearch = async () => {
    const doc = nlp(input);
    let verb = doc.verbs().toGerund().out('text');
    verb = verb.replace(/\b(is|are|was|were|am|be|been|being)\b\s*/g, '').trim();
    const rawInput = input.toLowerCase().trim();
  
    // ✅ Manually add '-ing' if NLP fails to apply it correctly
    if (!verb.endsWith('ing')) {
      if (verb.endsWith('e')) {
        verb = verb.slice(0, -1) + 'ing';
      } else if (verb.length > 0) {
        verb = verb + 'ing';
      }
    }
  
    console.log(`Processed Verb: ${verb}`); // ✅ Debugging output
  
    const validDuration = isNaN(duration) || duration <= 0 ? 30 : duration;
  
    try {
      // ✅ Encode the verb for safe API usage
      const encodedVerb = encodeURIComponent(verb);
      const response = await fetch(`https://api.api-ninjas.com/v1/caloriesburned?activity=${encodedVerb}`, {
        headers: { 'X-Api-Key': NINJAS_API_KEY }
      });
  
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
  
      const data = await response.json();
  
      if (data.length > 0) {
        const apiCaloriesPerMinute = data[0].total_calories / data[0].duration_minutes;
        const adjustedCalories = apiCaloriesPerMinute * validDuration;
  
        setSearchResult({
          name: data[0].name,
          total_calories: adjustedCalories
        });
  
        onAddExercise({
          exerciseName: data[0].name,
          duration: validDuration,
          caloriesBurned: adjustedCalories,
          date: new Date().toISOString()
        });
      } else {
        handleMETFallback(rawInput, validDuration);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('API Error occurred. Using MET Fallback.');
      handleMETFallback(rawInput, validDuration);
    }
  };
  
  

  const handleMETFallback = (rawInput, validDuration) => {
    const matchedExercise = Object.keys(MET_VALUES).find(ex => {
      const regex = new RegExp(`\\b${ex}\\b`, 'i');
      return regex.test(rawInput);
    });

    if (matchedExercise) {
      const met = MET_VALUES[matchedExercise];
      const caloriesBurned = ((met * userWeight * 3.5) / 200) * validDuration;

      onAddExercise({
        exerciseName: matchedExercise,
        duration: validDuration,
        caloriesBurned,
        date: new Date().toISOString()
      });

      setSearchResult({
        name: matchedExercise,
        total_calories: caloriesBurned
      });
    } else {
      console.error('Exercise not found in API or MET list');
      alert('Exercise not found. Please try a different term.');
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g., Running"
        className="border p-2 rounded w-full"
      />

      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        placeholder="Duration (minutes)"
        className="border p-2 rounded w-full mt-2"
        min="1"
      />

      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Search Exercise
      </button>

      {searchResult && (
        <div className="mt-2 p-2 bg-gray-200 rounded">
          <p><strong>Exercise:</strong> {searchResult.name}</p>
          <p><strong>Calories Burned:</strong> {searchResult.total_calories.toFixed(2)} kcal</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseSearch;
