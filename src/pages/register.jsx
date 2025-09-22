import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data); // Logs server response

      if (response.ok) {
        alert('Registration successful! Redirecting to login...');
        navigate('/login'); // ✅ Redirect to Login after successful registration
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <header className="w-full h-16 flex justify-between items-center py-4 px-8 bg-blue-800 shadow-lg fixed top-0 left-0 z-10 text-white">
        <h1 className="text-4xl font-bold"><a href="/">Fitto</a></h1>
        <nav className="space-x-6">
          <a href="/" className="hover:text-orange-400 text-lg">Home</a>
          <a href="/support" className="hover:text-orange-400 text-lg">Support</a>
        </nav>
      </header>

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
          <a href="/login" 
             className="text-blue-600 hover:underline align-center mt-4 block text-center"
          >
              Already have an account? Login here.
          </a>
        </form>
      </div>
    </div>
  );
}

export default Register;
