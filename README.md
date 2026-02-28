# Live Polling System

A real-time polling platform built for the Intervue SDE Intern Assignment.  
This system enables teachers to conduct live polls while students participate instantly with synchronized timers, real-time updates, and automatic state recovery.

Designed to behave like a production-ready application — even if users refresh the page or join late, the poll continues seamlessly.

---

## 🌐 Live Application

🔗 Frontend: https://interveu-live-polling.vercel.app/
🔗 Backend API: interveu-live-polling-production.up.railway.app

---

## 🧠 Overview

This application simulates a classroom polling environment with two roles:

👩‍🏫 **Teacher (Admin)**  
Creates and manages polls, monitors responses live, and reviews past results.

👨‍🎓 **Student (User)**  
Joins a session, answers questions within a time limit, and views results instantly.

The core focus of this system is resilience, fairness, and real-time synchronization.

---

## ✨ Features

### 👩‍🏫 Teacher Panel

✔️ Create polls with options and timer  
✔️ View live vote distribution  
✔️ Access poll history from database  
✔️ Ask a new question only after completion  
✔️ Recover active poll after refresh  

---

### 👨‍🎓 Student Experience

✔️ Enter name on first visit (unique per tab)  
✔️ Receive questions instantly  
✔️ Server-synced timer  
✔️ Vote within time limit  
✔️ View results after submission  
✔️ Late join shows remaining time only  

---

## 🛡️ System Behavior

### 🔄 State Recovery
Refreshing the page does not interrupt the ongoing poll.  
The application restores the exact state from the backend.

### ⏱️ Timer Synchronization
The server controls the timer to ensure fairness.  
Students joining late see only the remaining time.

### 🚫 Vote Integrity
Each student can vote only once per question.  
Duplicate or spam submissions are prevented server-side.

---

## 🏗️ Tech Stack

### Frontend
- React (Hooks + TypeScript)
- Socket.io Client

### Backend
- Node.js
- Express
- Socket.io
- TypeScript

### Database
- MongoDB / PostgreSQL

### Deployment
- Frontend: 
- Backend:

---

## 📂 Project Structure
live-polling-system/
│
├── backend/
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic layer
│   ├── models/             # Database schemas
│   ├── routes/             # Express routes
│   ├── sockets/            # Socket.io event handlers
│   ├── utils/              # Helper functions
│   ├── config/             # DB and environment configs
│   └── server.ts           # Backend entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Teacher & Student views
│   │   ├── hooks/          # Custom hooks (socket, timer, etc.)
│   │   ├── context/        # Global state management
│   │   ├── services/       # API & socket services
│   │   ├── styles/         # CSS / Tailwind files
│   │   └── main.tsx        # Frontend entry point
│
├── README.md
└── package.json
