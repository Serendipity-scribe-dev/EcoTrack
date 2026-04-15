# EcoTrack 🌍
> Gamified Carbon Footprint Tracker | SDG 13 – Climate Action

A full-stack MERN application where users log daily activities (transport, diet, energy), earn **Eco-XP**, level up from Seedling → Guardian, and contribute to a live **Global CO₂ Meter**.

## 🚀 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: Firebase Google Auth
- **Hosted on**: Render

## ✨ Features
- Matrix rain landing page with real-time Global CO₂ Meter
- XP leveling system with 5 rank badges
- Daily streak tracking
- Weekly emission trend charts (Recharts)
- Global leaderboard
- Mobile-first with bottom tab navigation

## 🛠 Local Development

### Backend
```bash
cd backend
npm install
npm run dev   # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173
```

## 📦 Deployment
Hosted as a single service on Render. Express serves the React build in production.
