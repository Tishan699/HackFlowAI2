# 🚀 HackFlow AI - Fullstack Platform

An end-to-end intelligent hackathon management platform built with **React 19 + Vite** frontend and **Node.js + Express + PostgreSQL** backend. Features automated **Multi-Factor Authentication (MFA)**, **AI-Generated Code Detection Lab**, **AI Platform Support Copilot**, rubric evaluation, file uploads (Max 20MB), and real-time telemetry.

---

## 🏗️ Architecture & Monorepo Structure

```text
hackathon-platform/
│
├── frontend/                  # Frontend (React 19 + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/        # AISupportBot, Navbar, Sidebar, HackathonCard, ProtectedRoute, EmailInboxDrawer
│   │   ├── pages/             # Landing, Login, Register, VerifyEmail, Dashboard, Hackathons, Teams, Submissions, Judges, Mentors, Attendance, Certificates, Analytics
│   │   ├── layouts/           # DashboardLayout
│   │   ├── context/           # AuthContext (MFA & 2FA State Management)
│   │   └── services/          # api.js & emailService.js
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                   # Backend (Node.js + Express + PostgreSQL + JWT + Multer + Nodemailer)
│   ├── src/
│   │   ├── config/            # db.js (Persistent fallback) & postgres.js (Supabase PostgreSQL)
│   │   ├── controllers/       # Auth, Hackathons, Teams, Projects, Judges, Support, Mentors, Attendance, Analytics
│   │   ├── middleware/        # JWT Authentication, Role Authorization & Multer File Upload
│   │   ├── routes/            # Express REST Endpoints
│   │   ├── utils/             # aiCodeAnalyzer.js, aiSupportKnowledge.js, mailer.js
│   │   └── server.js          # Express Entrypoint (Port 5000)
│   ├── uploads/               # Uploaded Pitch Decks & Project Files
│   ├── package.json
│   └── .env.example
│
├── vercel.json                # Vercel SPA Routing & Railway API Proxy Configuration
├── package.json               # Root scripts
└── .gitignore                 # Root gitignore rules
```

---

## 🚀 How to Push to a New GitHub Repository

Run these commands from the project root folder:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: HackFlow AI Fullstack Platform with AI Code Analyzer and Copilot"

# 4. Rename main branch
git branch -M main

# 5. Link your new GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

---

## ☁️ Deployment Guide

### 1. Backend Deployment on Railway

1. Go to [Railway](https://railway.app/) and click **New Project** ➔ **Deploy from GitHub repo**.
2. Select your repository.
3. In **Settings** ➔ **Root Directory**, set it to `/backend`.
4. In **Settings** ➔ **Build & Deploy**, set **Start Command** to:
   ```bash
   node src/server.js
   ```
5. In **Variables**, add your environment variables:
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgres://postgres.yourproject:password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require
   JWT_SECRET=your_super_secret_jwt_signature
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   SMTP_FROM="HackFlow AI" <no-reply@hackflow.dev>
   ```
6. In **Settings** ➔ **Networking**, click **Generate Domain** (e.g. `https://hackflowai-production.up.railway.app`).

---

### 2. Frontend Deployment on Vercel

1. Go to [Vercel](https://vercel.com/) and click **Add New...** ➔ **Project**.
2. Import your GitHub repository.
3. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default, `vercel.json` will build `frontend`)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
4. In **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://hackflowai-production.up.railway.app`
5. Click **Deploy**.

> `vercel.json` is pre-configured to proxy all `/api/*` requests directly to Railway and rewrite SPA pages to `/index.html` to avoid any white screens or CORS issues!

---

## 💻 Local Development

### Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000/api`.

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Organizer** | `john@hackflow.dev` | `password123` |
| **Participant** | `alex@neuralninjas.dev` | `password123` |
| **Judge** | `elena@judges.dev` | `password123` |
| **Mentor** | `mentor@cloud.dev` | `password123` |

---

## 🧠 AI Features

1. **AI Code & AI-Generated Detector Lab (Judges Panel)**:
   - Multi-signal synthetic LLM code detection (step comments, token burstiness, identifier density).
   - Security scanner for hardcoded API keys, JWTs, and database URIs.
   - Maintainability Index ($A/B/C/D$) and calibrated Rubric score recommendations.

2. **HackFlow Copilot (AI Support Assistant)**:
   - Floating interactive assistant available everywhere on the platform.
   - Answers platform questions (how to register, join teams, submit projects, use AI scanner, claim certificates).
   - Context-aware page prompts and direct 1-click navigation buttons.
