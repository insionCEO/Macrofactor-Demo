import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AiChatButton from '../ai/AiChatButton';
import AiChatBox from '../ai/AiChatBox';


// ✅ Load USDA API Key from .env or fallback to default
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;

const FoodLog = () => {
  const [foodLog, setFoodLog] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  const [newFood, setNewFood] = useState({
    meal: 'breakfast',
    name: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
    servingSize: '',
    per100gNutrients: {}
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // ✅ State for Date Picker
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoodLog(selectedDate);
  }, [selectedDate]); // ✅ Re-fetch when date changes

  // ✅ Fetch Food Log (with optional date)
  const fetchFoodLog = async (date) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0]; // Format to YYYY-MM-DD

    try {
      const response = await fetch(`http://localhost:5000/api/user/food-log?date=${formattedDate}`, {
        method: 'GET',
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setFoodLog(data.foodLog);
      } else {
        console.error('Failed to fetch food log');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching food log:', error);
      navigate('/login');
    }
  };

  // ✅ Search Food from USDA API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoadingSearch(true);
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchQuery}&api_key=${USDA_API_KEY}`);
      const data = await response.json();
      setSearchResults(data.foods || []);
    } catch (error) {
      console.error('Error fetching food data:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  // ✅ Populate Nutritional Data from Search Result
  const handleSelectFood = (foodItem) => {
    const nutrients = {};
    foodItem.foodNutrients.forEach(nutrient => {
      if (nutrient.nutrientName === 'Energy') nutrients.calories = nutrient.value;
      if (nutrient.nutrientName === 'Carbohydrate, by difference') nutrients.carbs = nutrient.value;
      if (nutrient.nutrientName === 'Protein') nutrients.protein = nutrient.value;
      if (nutrient.nutrientName === 'Total lipid (fat)') nutrients.fat = nutrient.value;
    });

    setNewFood({
      ...newFood,
      name: foodItem.description,
      servingGrams: 100,
      per100gNutrients: nutrients,
      calories: nutrients.calories || 0,
      carbs: nutrients.carbs || 0,
      protein: nutrients.protein || 0,
      fat: nutrients.fat || 0,
      servingSize: 1
    });

    setSearchResults([]);
  };

  // ✅ Add Food to Log (For Selected Date)
  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const formattedDate = selectedDate.toISOString();

    try {
      const response = await fetch('http://localhost:5000/api/user/food-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ ...newFood, date: formattedDate })
      });

      if (response.ok) {
        fetchFoodLog(selectedDate); // Refresh for the selected date
        setNewFood({ meal: 'breakfast', name: '', calories: '', carbs: '', protein: '', fat: '' });
      } else {
        console.error('Failed to add food');
      }
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  // ✅ Delete Food Entry
  const handleDelete = async (meal, foodId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/user/food-log/${meal}/${foodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (response.ok) fetchFoodLog(selectedDate);
      else console.error('Failed to delete food');
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen pt-20">
      {/* ✅ HEADER */}
      <header className="w-full h-16 flex justify-between items-center py-4 px-8 bg-blue-800 shadow-lg fixed top-0 left-0 z-10 text-white">
        <h1 className="text-4xl font-bold"><a href="/">Fitto</a></h1>
        <nav className="space-x-6 flex items-center">
          <a href="/" className="hover:text-orange-400 text-lg">Home</a>
          <a href="/dashboard" className="hover:text-orange-400 text-lg">Dashboard</a>
          <a href="/exercise-log" className="hover:text-orange-400 text-lg">Exercise Log</a>
          <a href="/support" className="hover:text-orange-400 text-lg">Support</a>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-4"
          >
            Logout
          </button>
        </nav>
      </header>

      <h1 className="text-3xl font-bold mb-4">Food Log</h1>

      {/* ✅ Date Picker for Past Logs */}
      <div className="mb-6">
        <label className="font-semibold mr-2">Select Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded-lg"
        />
      </div>

      {/* ✅ Food Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold">Search Food</h2>
        <form onSubmit={handleSearch} className="flex space-x-4">
          <input
            type="text"
            placeholder="Search food (e.g., chicken breast)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded-lg flex-1"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {loadingSearch ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* ✅ Search Results */}
        {searchResults.length > 0 && (
          <ul className="mt-4 border rounded-lg max-h-60 overflow-y-auto">
            {searchResults.map((food) => (
              <li
                key={food.fdcId}
                className="p-2 border-b cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectFood(food)}
              >
                {food.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Add Food */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold">Add Food</h2>
        <form onSubmit={handleFoodSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="meal"
            value={newFood.meal}
            onChange={(e) => setNewFood({ ...newFood, meal: e.target.value })}
            className="border p-2 rounded-lg"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
          </select>


          <input type="text" placeholder="Food Name" value={newFood.name} onChange={(e) => setNewFood({ ...newFood, name: e.target.value })} required className="border p-2 rounded-lg" />

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Serving (g)"
            value={newFood.servingGrams}
            onChange={(e) => {
              const grams = parseFloat(e.target.value) || 0;
              const scale = grams / 100;

              setNewFood({
                ...newFood,
                servingGrams: grams,
                calories: (newFood.per100gNutrients.calories * scale).toFixed(2),
                carbs: (newFood.per100gNutrients.carbs * scale).toFixed(2),
                protein: (newFood.per100gNutrients.protein * scale).toFixed(2),
                fat: (newFood.per100gNutrients.fat * scale).toFixed(2)
              });
            }}
            className="border p-2 rounded-lg"
          />

          <input type="number" placeholder="Calories" value={newFood.calories} onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })} required className="border p-2 rounded-lg" />
          <input type="number" placeholder="Carbs (g)" value={newFood.carbs} onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })} required className="border p-2 rounded-lg" />
          <input type="number" placeholder="Protein (g)" value={newFood.protein} onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })} required className="border p-2 rounded-lg" />
          <input type="number" placeholder="Fat (g)" value={newFood.fat} onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })} required className="border p-2 rounded-lg" />

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">Add Food</button>
        </form>
      </div>

      {/* ✅ Meal Sections */}
      {['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (
        <div key={meal} className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold capitalize">{meal}</h2>
          {foodLog[meal]?.length ? (
            <ul>
              {foodLog[meal].map(food => (
                <li key={food._id} className="flex justify-between items-center border-b py-2">
                  <span>{food.name} - {food.calories} kcal ({food.carbs}g C / {food.protein}g P / {food.fat}g F)</span>
                  <button onClick={() => handleDelete(meal, food._id)} className="bg-red-500 text-white px-2 py-1 rounded-lg">Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No food logged for {meal} on this date.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FoodLog;
