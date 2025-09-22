import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseSearch from './ExerciseSearch';
import ExerciseEntryCard from './ExerciseEntryCard';
import SummaryCard from './SummaryCard';
import AiChatButton from '../ai/AiChatButton';
import AiChatBox from '../ai/AiChatBox';

const ExerciseLog = () => {
    const [exerciseLog, setExerciseLog] = useState([]);
    const [todayCalories, setTodayCalories] = useState(0);
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        fetchExerciseLog();  // Fetch everything on first load
    }, []);

    // ✅ Fetch full exercise log and recalculate today's burned calories
    const fetchExerciseLog = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userId = JSON.parse(atob(token.split('.')[1])).id; // Extract userId from token

            const response = await fetch(`http://localhost:5000/api/exercise-log/user/${userId}`, {
                headers: { 'Authorization': token }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setExerciseLog(Array.isArray(data) ? data : []);
            recalculateTodayCalories(data);
        } catch (error) {
            console.error('Error fetching exercise log:', error);
        }
    };

    // ✅ Recalculate today's calories burned from full log
    const recalculateTodayCalories = (log) => {
        const today = new Date().toISOString().split('T')[0];
        const total = log
            .filter(entry => entry.date && entry.date.startsWith(today))
            .reduce((sum, entry) => sum + (entry.caloriesBurned || 0), 0);

        setTodayCalories(total);
    };

    // ✅ Add new exercise (direct append + update todayCalories)
    const handleAddExercise = async (newExercise) => {
        try {
            const response = await fetch('http://localhost:5000/api/exercise-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
                body: JSON.stringify(newExercise) // No need for userId here
            });

            if (response.ok) {
                const { savedExercise } = await response.json();

                // ✅ Directly append to log and update today's calories (more efficient for adds)
                setExerciseLog(prev => [...prev, savedExercise]);

                // ✅ Only add to today's calories if the new exercise is from today
                const today = new Date().toISOString().split('T')[0];
                if (savedExercise.date.startsWith(today)) {
                    setTodayCalories(prev => prev + savedExercise.caloriesBurned);
                }
            } else {
                console.error('Failed to add exercise');
            }
        } catch (error) {
            console.error('Error adding exercise:', error);
        }
    };

    // ✅ Delete exercise (full re-fetch to recalculate)
    const handleDeleteExercise = async (exerciseId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/exercise-log/${exerciseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': localStorage.getItem('token') }
            });

            if (response.ok) {
                await fetchExerciseLog();  // ✅ Full refresh to keep data accurate
            } else {
                console.error('Failed to delete exercise');
            }
        } catch (error) {
            console.error('Error deleting exercise:', error);
        }
    };

    // ✅ Edit exercise (full re-fetch to recalculate)
    const handleEditExercise = async (exerciseId, updatedExercise) => {
        try {
            const response = await fetch(`http://localhost:5000/api/exercise-log/${exerciseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
                body: JSON.stringify(updatedExercise)
            });

            if (response.ok) {
                await fetchExerciseLog();  // ✅ Full refresh to keep data accurate
            } else {
                console.error('Failed to update exercise');
            }
        } catch (error) {
            console.error('Error updating exercise:', error);
        }
    };

    return (
        <>
            {/* ✅ HEADER */}
            <header className="w-full h-16 flex justify-between items-center py-4 px-8 bg-blue-800 shadow-lg fixed top-0 left-0 z-10 text-white">
                <h1 className="text-4xl font-bold"><a href="/">Fitto</a></h1>
                <nav className="space-x-6 flex items-center">
                    <a href="/" className="hover:text-orange-400 text-lg">Home</a>
                    <a href="/dashboard" className="hover:text-orange-400 text-lg">Dashboard</a>
                    <a href="/food-log" className="hover:text-orange-400 text-lg">Food Log</a>
                    <a href="/support" className="hover:text-orange-400 text-lg">Support</a>
                </nav>
            </header>

            {/* ✅ MAIN CONTENT */}
            <div className="p-6 bg-gray-50 min-h-screen pt-20">
                <h1 className="text-3xl font-bold mb-4">Exercise Log</h1>

                {/* ✅ Exercise Search */}
                <ExerciseSearch onAddExercise={handleAddExercise} />

                {/* ✅ Summary Card (TDEE + Burned Calories) */}
                <SummaryCard todayCalories={todayCalories} />

                {/* ✅ Exercise Entries List */}
                <div className="mt-4">
                    {exerciseLog.length > 0 ? (
                        exerciseLog.map((exercise) => (
                            <ExerciseEntryCard
                                key={exercise._id}
                                exercise={exercise}
                                onDelete={() => handleDeleteExercise(exercise._id)}
                                onEdit={(updatedExercise) => handleEditExercise(exercise._id, updatedExercise)}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 mt-6">
                            <p>No exercises logged yet. Start by adding your first exercise above! 💪</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ExerciseLog;
