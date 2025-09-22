import { Link, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Register from './pages/register';
import Login from './pages/login';
import Setup from './pages/SetupWizard';
import Dashboard from './pages/dashboard';
import FoodLog from './pages/foodLog';
import ExerciseLog from './exercises/ExerciseLog';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/food-log" element={<FoodLog />} />
        <Route path="/exercise-log" element={<ExerciseLog />} />
      </Routes>
    </>
  );
}

export default App;
