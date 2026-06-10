# EvoCareer AI 🚀

EvoCareer AI is a full-stack web app that helps you map out your career path. You tell it where you want to go professionally, and it helps you simulate different paths, plan milestones, and prepare for what's ahead — including mock interviews and startup idea exploration.

---

## What It Does

### 🗺️ Career Path Simulation
Explore different career trajectories based on your current skills and goals. The app uses AI to show you realistic paths and what steps you'd need to take to get there.

### 🎤 Interview Preparation
Practice mock interviews tailored to your target role. Get feedback and track your progress over time.

### 🚀 Startup Mode
Have a startup idea? The app lets you explore it — stress testing the concept and thinking through what it would take to build it.

### 🔐 Authentication
Secure login and signup with JWT tokens and bcrypt password hashing. Your data stays yours.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, TailwindCSS, Framer Motion |
| Backend | Python, FastAPI |
| Database | SQLite (local dev) |
| Auth | JWT tokens + bcrypt |
| Realtime | WebSockets |
| Deployment | Frontend → Vercel, Backend → Render |

---

## How to Run It Locally

You need two terminals — one for the backend, one for the frontend.

### Terminal 1 — Backend (API)

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API starts at `http://localhost:8000`
Interactive API docs: `http://localhost:8000/api/docs`

The SQLite database (`evocareer.db`) is created automatically on first run.

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:3000` or `http://localhost:3001`

---

## Test Account

A test user is pre-configured for local development:

- **Email**: `test2@test.com`
- **Password**: `password123`

To reset your local database, just delete `backend/evocareer.db` — it regenerates on next startup.

---

## Project Structure

```
EvoCareer-AI/
├── backend/
│   ├── main.py                     # FastAPI app entry point
│   ├── requirements.txt
│   ├── evocareer.db                # SQLite database (auto-created)
│   └── app/
│       ├── api/                    # Route handlers
│       │   ├── auth.py
│       │   ├── interview.py
│       │   ├── profile.py
│       │   ├── simulation.py
│       │   └── startup.py
│       ├── agents/agents.py        # AI agent logic
│       ├── core/                   # Config, DB, security
│       ├── integrations/           # GitHub + LinkedIn integrations
│       ├── models/                 # SQLAlchemy models
│       ├── nlp/                    # Resume parsing + NLP
│       └── schemas/                # Pydantic schemas
└── frontend/
    ├── src/
    │   ├── pages/                  # Landing, Dashboard, Interview, Simulate, Startup
    │   ├── components/ui/          # Reusable UI components
    │   ├── hooks/                  # WebSocket hook
    │   ├── store/                  # Auth state
    │   └── utils/api.ts            # API client
    ├── package.json
    └── vite.config.ts
```

---

## Deployment

- **Backend** → [Render](https://render.com) (see `backend/Procfile`)
- **Frontend** → [Vercel](https://vercel.com) (see `frontend/vercel.json`)

Both services auto-deploy when you push to the main branch.

---

## Notes

- `frontend/.env.local` contains environment variables — do not commit this file publicly if it has real API keys.
- WebSocket support is built in for real-time interview and simulation features.
