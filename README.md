# 🚀 HackFlow Fullstack Platform

AI-Powered Hackathon Management Platform with **React + Vite** frontend and **Node.js + Express** backend, featuring automated **Multi-Factor Authentication (MFA)**, email verification, AI project evaluation, and real-time attendance tracking.

---

## 🏗️ Architecture

```text
hackathon-platform/
│
├── frontend/                  # Frontend (React 19 + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar, StatCard, HackathonCard, ProtectedRoute, EmailInboxDrawer
│   │   ├── pages/             # Landing, Login, Register, VerifyEmail, Dashboard, Hackathons, Teams, Submissions, Judges, Mentors, Attendance, Certificates, Analytics
│   │   ├── layouts/           # DashboardLayout
│   │   ├── context/           # AuthContext (MFA & 2FA State Management)
│   │   └── services/          # api.js & emailService.js
│   ├── package.json
│   ├── vite.config.js
│   └── .env                   # VITE_API_URL=http://localhost:5000/api
│
├── backend/                   # Backend (Node.js + Express + JWT + Multer + Nodemailer)
│   ├── src/
│   │   ├── config/            # db.js (Persistent Database) & postgres.js (Supabase)
│   │   ├── controllers/       # Auth (MFA/2FA), Hackathons, Teams, Projects, Judges, Mentors, Attendance, Analytics
│   │   ├── middleware/        # JWT Authentication, Role Authorization & Multer File Upload
│   │   ├── routes/            # Express REST Endpoints
│   │   ├── utils/             # Nodemailer Mailer & AI Project Evaluator
│   │   └── server.js          # Express Entrypoint (Port 5000)
│   ├── data/
│   │   └── database.json      # Persistent JSON Database Bridge
│   ├── uploads/
│   │   └── submissions/       # Uploaded 20MB Pitch Decks & Project Files
│   ├── package.json
│   └── .env                   # Database, JWT & SMTP configuration
│
└── .gitignore                 # Root gitignore rules
```

---

## ⚡ Quick Start

### 1. Start the Backend Server
```bash
cd hackathon-platform/backend
npm install
npm run dev
# or: node src/server.js
```
> Server runs on `http://localhost:5000` with Base API at `http://localhost:5000/api`.

### 2. Start the Frontend Application
```bash
cd hackathon-platform/frontend
npm install
npm run dev
```
> Frontend runs on `http://localhost:5173`.

---

## 🔐 Authentication & Multi-Factor Authentication (MFA)

### Test Accounts
| Role | Email | Password |
|---|---|---|
| **Organizer** | `john@hackflow.dev` | `password123` |
| **Participant** | `alex@neuralninjas.dev` | `password123` |
| **Judge** | `elena@judges.dev` | `password123` |
| **Mentor** | `mentor@cloud.dev` | `password123` |

### Registration & Verification Flow
1. Sign up on `/register`.
2. A 6-digit verification code is generated and dispatched via email (`POST /api/auth/register`).
3. You are redirected to `/verify-email`.
4. Enter the 6-digit code (or use the on-screen **"Sent Emails"** simulator drawer pill to click **"Quick Fill"**).
5. The account is activated with `isEmailVerified: true` and `mfaEnabled: true`.

---

## 📡 API Endpoints Reference

### Authentication & MFA
- `POST /api/auth/register` - Create account & dispatch verification email
- `POST /api/auth/verify-otp` - Verify 6-digit email OTP & activate account
- `POST /api/auth/send-verification-email` - Resend verification OTP code
- `POST /api/auth/login` - Sign in (returns JWT or prompts 2FA challenge if enabled)
- `POST /api/auth/verify-2fa` - Verify 2FA code during login
- `GET /api/auth/profile` - Authenticated user profile (`Bearer <token>`)

### Competitions & Hackathons
- `GET /api/hackathons` - List all competitions
- `GET /api/hackathons/:id` - Competition details
- `POST /api/hackathons` - Create new hackathon
- `PUT /api/hackathons/:id` - Update hackathon details
- `DELETE /api/hackathons/:id` - Remove hackathon

### Teams & Rosters
- `GET /api/teams` - List all teams (supports `?hackathonId=...`)
- `POST /api/teams` - Create a team
- `POST /api/teams/join` - Join existing team
- `PATCH /api/teams/:id/checkin` - Toggle QR attendance check-in status

### Project Submissions & AI Scoring
- `GET /api/projects` - List project submissions
- `POST /api/projects` - Submit project (runs automated AI evaluation for Innovation, Execution, UI/UX, Impact)
- `POST /api/projects/:id/score` - Judge evaluation scoring

### Mentors & Attendance
- `GET /api/mentors` - List available mentors
- `POST /api/mentors/book` - Book 1-on-1 mentorship session
- `GET /api/attendance` - Attendance summary & check-in metrics
- `POST /api/attendance/scan` - Process QR badge scan

### Analytics
- `GET /api/analytics` - Telemetry, track popularity, and score histogram
