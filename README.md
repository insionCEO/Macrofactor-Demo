# FITTO
FITTO is a fitness tracking web application that helps users monitor their daily caloric intake, exercise routines, weight progress, and nutrition goals. With an intuitive dashboard and smart data logging, FITTO makes fitness tracking seamless.

## 🚀 Features

### 🏠 Dashboard
- Displays Total Daily Energy Expenditure (TDEE) and Basal Metabolic Rate (BMR).
- Tracks macronutrients (Carbs, Protein, Fat) with real-time updates.
- Visual progress on weight tracking with an interactive graph.
- Summary of exercise calories burned.

### 🍽️ Food Log
- Log meals by categories: Breakfast, Lunch, Dinner, Snacks.
- Tracks calories and macronutrients for daily consumption.
- Provides real-time updates on total calories consumed vs. TDEE.

### 💪 Exercise Log
- Log workout sessions, including exercise name, duration, and calories burned.
- Uses Metabolic Equivalent of Task (MET) for accurate calorie expenditure estimates.
- Displays total calories burned per day.

### ⚖️ Weight Tracker
- Users can log and edit their weight history.
- A visual weight progress chart to track changes over time.
- Set a target weight goal and monitor progress with percentage completion.

### 🔒 Authentication & Security
- JWT-based authentication for secure API requests.
- User registration & login with encrypted passwords.
- Protected routes requiring authentication.

## 🛠️ Tech Stack

### 🌐 Frontend
- React (Vite) + TailwindCSS
- Recharts for data visualization
- React Circular Progressbar for visual goals

### 🔧 Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication for secure login
- bcrypt.js for password hashing


# How to install and run?
- Go to 'Code' then clone it using git clone <copied-link>
- open folder in IDE of your choice
- open terminal
- type 'npm install' to install dependencies
- type 'npm run dev'

# If you have no GitHub yet, try this:
- Go to Release then click Source Code (zip)
- then extract to destination folder
- open folder in IDE of your choice
- open terminal
- type 'npm install' to install dependencies
- type 'npm run dev'

# Config
- declare your variables first in dotenv
- Initialize JWT Secret, Expiry date, and your Gemini API Key. Use the experimental one if you want free api
- Get Ninjas API Key for Exercise and USDA API Key for Food search

# To All users
- This is totally free for now, you can improve it if you want but this project is for my school. I also use it as my own fitness app so that I can track my own progress
- Sorry for the UI I don't have time for design, I just want to prioritize functionalities. Maybe soon I can improve the UI.

# Bugs report
- no bugs yet as of 03/13/25

  

