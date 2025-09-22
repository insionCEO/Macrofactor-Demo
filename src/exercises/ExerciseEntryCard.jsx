import React from 'react';

const ExerciseEntryCard = ({ exercise, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded shadow mb-2 flex justify-between items-center">
            <div>
                <p><strong>{exercise.exerciseName}</strong></p>
                <p>{exercise.duration} mins | {exercise.caloriesBurned.toFixed(2)} kcal</p>
                <p>{new Date(exercise.date).toLocaleString()}</p>
            </div>
            <button
                onClick={onDelete}  // ✅ Just call the parent's delete handler directly
                className="bg-red-500 text-white px-3 py-1 rounded"
            >
                Delete
            </button>
        </div>
    );
};

export default ExerciseEntryCard;
