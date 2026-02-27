# 🏥 PhysioConnect -- Physiotherapy & Rehabilitation Tracking Platform

A Full-Stack PERN Application enabling secure remote physiotherapy
tracking, doctor-patient collaboration, and structured rehabilitation
monitoring.

------------------------------------------------------------------------

## 📌 Problem Statement

Traditional physiotherapy systems face major challenges:

-   Lack of real-time communication between doctor and patient
-   No structured remote exercise assignment tracking
-   Poor rehabilitation progress monitoring
-   No centralized feedback system
-   Manual documentation inefficiency
-   Difficulty managing multiple patient recovery plans

------------------------------------------------------------------------

## 💡 Solution

PhysioConnect solves these issues by providing:

-   Secure JWT-based authentication
-   Doctor Portal
-   Patient Portal
-   6-digit alphanumeric doctor connection code system
-   Exercise assignment tracking
-   Pain logging & progress visualization
-   Real-time doctor-patient data sync

Doctors can assign exercises, monitor progress, and review recovery logs
--- while patients can complete exercises and track improvement
digitally.

------------------------------------------------------------------------

## 🏗️ Tech Stack

### Frontend

-   React (Vite)
-   Axios
-   Context API
-   Drag & Drop UI

### Backend

-   Node.js
-   Express.js
-   PostgreSQL
-   JWT Authentication
-   bcrypt (password hashing)
-   nodemon (development)

### Architecture

-   PERN Stack (PostgreSQL, Express, React, Node)
-   Concurrently (run frontend & backend together)

------------------------------------------------------------------------

# 🚀 Running the Project Locally

## Prerequisites

-   Node.js (v16+)
-   PostgreSQL installed
-   Database created
-   Backend .env configured

Example .env:

PORT=5000 DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key

------------------------------------------------------------------------

## 🗄️ Step 1 -- Initialize Database

Run the SQL statements inside:

backend/db/schema.sql

Using pgAdmin, psql, or any PostgreSQL tool.

------------------------------------------------------------------------

## ⚡ Step 2 -- Install Dependencies (Root Folder)

From the main project directory:

npm install

------------------------------------------------------------------------

## ▶ Step 3 -- Run Full Application

This project uses concurrently. Start both frontend and backend with:

npm run dev

Backend runs on: http://localhost:5000

Frontend runs on: http://localhost:5173

------------------------------------------------------------------------

# 🧪 Testing Workflow

1.  Register a Doctor (/register → select Doctor)
2.  Register a Patient (incognito window → select Patient)
3.  Doctor logs in and assigns exercises
4.  Patient logs progress and pain levels
5.  Doctor monitors progress updates instantly

------------------------------------------------------------------------

# 🔐 Security Features

-   JWT Authentication
-   Role-based Authorization
-   Password hashing (bcrypt)
-   Protected API routes
-   Secure doctor-patient linking

------------------------------------------------------------------------

# 📈 Real-World Problems This Solves

-   Remote patient monitoring
-   Post-surgery rehabilitation tracking
-   Chronic pain management
-   Sports injury recovery tracking
-   Rural healthcare accessibility
-   Hospital workload optimization

------------------------------------------------------------------------

# 📂 Project Structure

healthcare/ │ ├── backend/ ├── frontend/ ├── package.json (root -
concurrently config) └── README.md

------------------------------------------------------------------------

# 🌟 Future Improvements

-   AI-based posture detection
-   Real-time chat via WebSockets
-   Advanced analytics dashboard
-   Cloud deployment
-   Mobile app version

------------------------------------------------------------------------

# 👨‍💻 Developed By

Likhith Sai Vinnakota\
Computer Science Student \| Full Stack Developer
