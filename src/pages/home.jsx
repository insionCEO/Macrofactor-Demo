import {hello} from 'react'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex flex-col p-0">
      <header className="w-full h-16 flex justify-between items-center py-4 px-8 bg-blue-800 shadow-lg fixed top-0 left-0 z-10">
        <h1 className="text-4xl font-bold"><a href="/" className="hover:text-orange-400">Fitto</a></h1>
        <nav className="space-x-6">
          <a href="/" className="hover:text-orange-400 text-lg">Home</a>
          <a href="/dashboard" className="hover:text-orange-400 text-lg">Dashboard</a>
          <a href="/support" className="hover:text-orange-400 text-lg">Support</a>
          <a href="/register" className="hover:text-orange-400 text-lg">Sign Up</a>
          <a href="/login" className="hover:text-orange-400 text-lg">Login</a>
        </nav>
      </header>

      <main className="text-center mt-20 flex-grow flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-4">AI-Powered Fitness App</h2>
        <p className="max-w-2xl text-lg md:text-xl mb-8">
          Fitto is an AI-powered fitness web application designed to personalize your fitness journey. It intelligently adapts to your individual goals, offering tailored workout programs and nutrition plans that optimize your path toward success. Fitto provides in-depth insights into your weight trajectory, helping you understand trends and make data-driven decisions. Whether you're aiming to lose weight, build muscle, or maintain a healthy lifestyle, Fitto's smart algorithms continuously adjust your training and nutrition strategies to ensure you stay on track and maximize results. Embrace a personalized fitness experience that evolves with you—only with Fitto.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">Get Started</a>
        </div>
      </main>
    </div>
  );
}

export default Home;
