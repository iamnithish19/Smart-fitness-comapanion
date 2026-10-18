# 🏋️ Smart Fitness Companion

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available%20Now-brightgreen?style=for-the-badge&logo=github)](https://iamnithish19.github.io/Smart-fitness-comapanion/)
[![Built With React & Vite](https://img.shields.io/badge/React%2018-Vite-blue?style=for-the-badge&logo=react)](https://vitejs.dev/)

> **Live Application URL:**  
> 🌐 **[https://iamnithish19.github.io/Smart-fitness-comapanion/](https://iamnithish19.github.io/Smart-fitness-comapanion/)**  
> *Anyone can use this application directly in any web browser at any time without running a local server!*

---

## 🌟 Highlights & Features

- **📊 Comprehensive Health & Telemetry Dashboard**: Heart rate zones, sleep quality index, VO2 max, step tracker, water hydration tracker, and real-time activity feed.
- **🏋️ Live Workout Tracker**: Step-by-step active exercise guidance, set logging, target heart rate feedback, and calorie computation.
- **🥗 Smart Nutrition & Dietitian Engine**: Personalized macro splits (Protein, Carbs, Fats), BMR/TDEE analysis based on age & BMI, recipe library, and meal plans.
- **🏆 Gamification & Community**: Daily challenges, streaks, achievement badges, community leaderboard, social feed, and member rankings.
- **🏢 Gym Master Portal & SaaS Management**: Member roster, multi-tier membership plans, QR access pass generation, attendance telemetry, and revenue analytics.
- **💾 Dual Storage Architecture**: Operates 100% offline via browser `localStorage` + optional real-time cloud sync with MongoDB Atlas.
- **🎨 Ultra-responsive UI**: Sleek dark & light theme modes, glassmorphic cards, and mobile-friendly design.

---

## 🚀 Instant Online Access

You can open and use the live application right now:
👉 **[Open Smart Fitness Companion Online](https://iamnithish19.github.io/Smart-fitness-comapanion/)**

*(To enable automated deployments on GitHub: Navigate to repository **Settings** → **Pages** → under **Build and deployment**, select **GitHub Actions**)*.

---

## 💻 Local Development Setup

If you wish to clone and run the project locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/iamnithish19/Smart-fitness-comapanion.git

# 2. Enter project directory
cd Smart-fitness-comapanion

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Repository Structure

```
smart-fitness-companion/
├── .github/
│   └── workflows/
│       └── deploy.yml               # Automated GitHub Pages CI/CD deployment
├── public/                          # Static hero and gym imagery
├── dataset/                         # Knowledge base, exercises, and telemetry datasets
├── src/
│   ├── main.jsx                     # Application entry point
│   ├── App.jsx                      # Primary app orchestrator & tab routing
│   ├── components/                  # 25+ Interactive feature modules
│   │   ├── Dashboard.jsx
│   │   ├── WorkoutLive.jsx
│   │   ├── FitnessPlans.jsx
│   │   ├── NutritionPlan.jsx
│   │   ├── RecipeLibrary.jsx
│   │   ├── SleepAnalytics.jsx
│   │   ├── GymMasterPortal.jsx
│   │   ├── CommunityLeaderboard.jsx
│   │   └── ...
│   ├── services/
│   │   ├── db.js                    # Embedded reactive storage & CRUD engine
│   │   ├── mongoService.js          # MongoDB Atlas cloud synchronization
│   │   ├── currencyService.js       # Real-time multi-currency converter
│   │   └── otpService.js            # Secure OTP authentication service
│   ├── data/
│   │   └── db.json                  # Seed data database
│   └── styles/
│       └── global.css               # Design system & dark/light mode styles
├── index.html
├── vite.config.js
└── package.json
```

---

## 📜 License

Created with ❤️ by [iamnithish19](https://github.com/iamnithish19).
