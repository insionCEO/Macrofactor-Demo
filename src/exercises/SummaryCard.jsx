const SummaryCard = ({ todayCalories }) => {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold">Today's Burned Calories</h2>
        <p className="text-3xl font-bold text-blue-600">{todayCalories.toFixed(2)} kcal</p>
      </div>
    );
  };
  
  export default SummaryCard;
  