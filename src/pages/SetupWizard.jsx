import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SetupWizard() {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
    activityLevel: '',
    goal: 'maintain',
    rate: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const { age, height, weight, gender, activityLevel, goal, rate } = formData;

    if (!age || !height || !weight || !gender || !activityLevel || (goal !== 'maintain' && !rate)) {
      alert('Please fill out all fields!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/setup-complete', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Setup Success:', data);
        alert('Setup completed!');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        console.error('Setup Failed:', error);
        alert('Setup failed. Please try again.');
      }
    } catch (error) {
      console.error('Setup Error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Setup Your Profile</h2>

        <input type="number" name="age" placeholder="Age" required onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg"/>
        <input type="number" name="height" placeholder="Height (cm)" required onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg"/>
        <input type="number" name="weight" placeholder="Weight (kg)" required onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg"/>

        <select name="gender" required onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select name="activityLevel" required onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg">
          <option value="">Select Activity Level</option>
          <option value="sedentary">Sedentary (little or no exercise)</option>
          <option value="lightly_active">Lightly Active (1-3 days/week)</option>
          <option value="moderately_active">Moderately Active (3-5 days/week)</option>
          <option value="very_active">Very Active (6-7 days/week)</option>
          <option value="extra_active">Extra Active (physical job or intense training)</option>
        </select>

        <select name="goal" required onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded-lg">
          <option value="maintain">Maintain Weight</option>
          <option value="lose">Lose Weight</option>
          <option value="gain">Gain Weight</option>
        </select>

        {formData.goal !== 'maintain' && (
          <input
            type="number"
            name="rate"
            placeholder={formData.goal === 'lose' ? '20-25% Recommended' : '10-15% Recommended'}
            required
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 border rounded-lg"
          />
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Complete Setup
        </button>
      </form>
    </div>
  );
}

export default SetupWizard;
