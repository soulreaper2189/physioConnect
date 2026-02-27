# Running the Healthcare Platform Locally

This document explains how to test the frontend and backend for the Healthcare project on your local machine.

## Prerequisites
- Node.js (v16+)
- PostgreSQL Database
- Ensure the backend `.env` is configured correctly with your database credentials.

## Step 1: Initialize the Database (If not already done)
The `assigned_exercises` feature requires a small schema update. To ensure it exists, please run the SQL statements found in `backend/db/schema.sql` within your Postgres database tool (like pgAdmin or `psql`).

## Step 2: Start the Backend (API)
The backend requires nodemon. Ensure you have installed the dependencies first.
1. Open a terminal.
2. Navigate to the backend directory:
   ```bash
   cd c:/Users/likhi/Desktop/healthcare/backend
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   > The server should start on `http://localhost:5000`.

## Step 3: Start the Frontend (React APP)
The React app uses Vite and needs its own terminal to run concurrently with the backend.
1. Open a **new** terminal window.
2. Navigate to the frontend directory:
   ```bash
   cd c:/Users/likhi/Desktop/healthcare/frontend
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > The frontend should start, typically on `http://localhost:5173`. Open this URL in your browser.

## Step 4: Testing the Flow
To test the complete workflow involving AI, Doctor, and Patient routing:

1. **Register a Doctor:** Go to `/register` and create an account, making sure to select **Doctor**.
2. **Register a Patient:** Open an incognito window or log out, then go to `/register` and create a second account, selecting **Patient**.
3. **Doctor Assignment:** Login as the **Doctor**. You should see the patient listed. Drag an exercise from the right panel and drop it onto the patient's card. You will see a success notification.
4. **Patient View:** Login as the **Patient**. You should see the newly assigned exercise on your dashboard.
5. **Log Progress:** As the patient, use the form to log a pain level and notes.
6. **Chart & Reflection:** Once you log progress, it will show up on your chart. Switch back to the Doctor account and you will be able to click on that patient to see their new logs appear instantly.
