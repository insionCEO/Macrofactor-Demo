import { useState } from 'react';
import { jwtDecode } from "jwt-decode"; // ✅ Import jwt-decode

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [user, setUser] = useState(null); // ✅ To store decoded user info

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);

      const decoded = jwtDecode(data.token);

      // ✅ Redirect to Setup Wizard if not complete
      if (!decoded.isSetupComplete) {
        window.location.href = '/setup';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login Error:', error);
    alert('Login failed. Please try again.');
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

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg mt-20">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Login</h2>
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
            Login
          </button>
          <a href="/register" 
             className="text-blue-600 hover:underline align-center mt-4 block text-center"
          >
              Are you new here? Register here.
          </a>
        </form>

        {/* ✅ Display user info if logged in */}
        {user && (
          <div className="mt-4 bg-green-100 text-green-800 p-4 rounded-lg">
            <h3 className="font-bold">Logged in as:</h3>
            <p>Username: {user.username}</p>
            <p>User ID: {user.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
