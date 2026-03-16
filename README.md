# EvoCareer AI 🚀

EvoCareer AI is a full-stack web application designed to help users simulate their future career paths and plan the necessary milestones to achieve their professional goals.

## Tech Stack
*   **Frontend**: React, Vite, Framer Motion, TailwindCSS
*   **Backend**: Python, FastAPI, SQLite (development)
*   **Authentication**: Custom Native bcrypt & JWT Tokens

---

## 🛠 Getting Started (Running on Localhost)

To run the complete application on your local machine, you need to start both the Python backend and the React frontend in separate terminals.

### 1. Start the Backend API (Localhost:8000)
The backend requires Python 3.8+ and serves the API on port `8000`.

Open a terminal and run the following commands:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The database (`evocareer.db`) will be automatically created. The API documentation will be available at: http://localhost:8000/api/docs

### 2. Start the Frontend Application (Localhost:3000/3001)
The frontend requires Node.js and runs on Vite's local dev server.

Open a **new** terminal (while the backend is still running) and type:
```bash
cd frontend
npm install
npm start
```

Your browser should automatically open the app at `http://localhost:3001` or `http://localhost:3000`.

---

## 🚀 Deployment

We have a dedicated deployment walkthrough available! See `deployment_guide.md` in the project documentation to learn how to deploy the backend to **Render** and the frontend to **Vercel** automatically.

---

## 🔐 Authentication Details

By default, the development database (`evocareer.db`) stores passwords using standard `bcrypt` hashing prefixed by an `SHA-256` digest to maintain security while bypassing password length limitations.

If you ever need to reset your local database, simply delete `backend/evocareer.db` and the API will regenerate it cleanly on the next startup.

*   **Test User Configured:** `test2@test.com`
*   **Test Password:** `password123`
